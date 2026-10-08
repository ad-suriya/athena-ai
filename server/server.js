require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();
const port = process.env.PORT || 5001;

// === Enhanced Security Middleware ===
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// === Rate Limiting ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});
app.use(limiter);

// === Firebase Admin SDK Initialization ===
const initializeFirebase = () => {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!privateKey) {
      console.warn('⚠️ Firebase private key not found');
      return null;
    }

    const firebaseConfig = {
      credential: admin.credential.cert({
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    };

    return admin.initializeApp(firebaseConfig);
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return null;
  }
};

const firebaseApp = initializeFirebase();

// === Configuration ===
const config = {
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash-001',
  maxTokens: parseInt(process.env.MAX_TOKENS) || 1000,
  temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
  systemPrompt: `
You are Athena AI — an empathetic and reflective counseling assistant, running on the Gemini model.

Your purpose is to help users understand and process their emotions, gain insight, and practice self-compassion. You respond with warmth, clarity, and gentle curiosity, using short paragraphs and simple language so the user never feels overwhelmed.
  `.trim()
};

// === AI Service Initialization ===
const initializeAIServices = () => {
  const services = {
    gemini: null,
  };

  if (process.env.VERTEX_PROJECT_ID && process.env.VERTEX_LOCATION) {
    try {
      const vertex_ai = new VertexAI({
        project: process.env.VERTEX_PROJECT_ID,
        location: process.env.VERTEX_LOCATION
      });

      services.gemini = vertex_ai.preview.getGenerativeModel({
        model: config.geminiModel,
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature,
        },
      });
      console.log('✅ Vertex AI initialized');
    } catch (error) {
      console.error('❌ Vertex AI initialization error:', error);
    }
  } else {
    console.warn('⚠️ VERTEX_PROJECT_ID or VERTEX_LOCATION not found');
  }

  return services;
};

const aiServices = initializeAIServices();

// === Middleware ===
app.use(express.json({ limit: '10kb' }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.options('*', cors());

// === Google Auth Endpoint ===
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'No token provided' });

    if (!firebaseApp && process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Firebase not initialized. Dev mode bypass.');
      return res.status(200).json({
        user: {
          email: 'dev@example.com',
          uid: 'dev-user-id',
          isDev: true,
        },
      });
    }

    if (!firebaseApp) {
      return res.status(503).json({ error: 'Authentication service unavailable' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    res.status(200).json({
      message: 'Authenticated',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || 'User',
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// === Unified Chat Endpoint ===
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    console.log(`📨 Chat request - Message: ${message.substring(0, 50)}...`);

    if (!aiServices.gemini) {
      return res.status(503).json({ error: 'Gemini (Vertex AI) service is not configured' });
    }

    try {
      const conversationHistory = Array.isArray(history)
        ? history
          .filter((msg) => msg && msg.role && msg.content)
          .map(
            (msg) =>
              `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
          )
          .join('\n\n')
        : '';

      const basePrompt = config.systemPrompt;
      const prompt = conversationHistory
        ? `${basePrompt}\n\n${conversationHistory}\n\nHuman: ${message}\n\nAssistant:`
        : `${basePrompt}\n\nHuman: ${message}\n\nAssistant:`;

      const reqObj = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      };

      const result = await aiServices.gemini.generateContent(reqObj);
      const response = await result.response;

      if (!response || !response.candidates || response.candidates.length === 0) {
        throw new Error('Empty response from Vertex AI Gemini');
      }

      const text = response.candidates[0].content.parts[0].text;

      return res.json({
        response: text,
        modelUsed: 'gemini',
      });
    } catch (error) {
      console.error('Gemini error:', error);
      return res.status(500).json({
        error: 'Gemini service error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// === Health Check Endpoint ===
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      firebase: firebaseApp ? 'operational' : 'unavailable',
      gemini: aiServices.gemini ? 'operational' : 'unavailable',
    },
  });
});

// === Minerva Status Endpoint (Legacy Support) ===
app.get('/api/minerva-status', async (req, res) => {
  res.json({ status: 'offline', model: 'none', backing: 'none' });
});

// === Error Handlers ===
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// === Server Startup ===
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log('🛡️ Security middleware enabled');
  console.log('🤖 Available AI Services:');
  console.log(`- Gemini (Vertex AI): ${aiServices.gemini ? config.geminiModel : 'Disabled'}`);
});
