require('dotenv').config();
const fetch = require('node-fetch'); // still here in case you use it elsewhere
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 5000;

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
    // Handle Firebase private key formatting for different environments
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

// === AI Service Initialization ===
const initializeAIServices = () => {
  const services = {
    openai: null,
    gemini: null,
  };

  // OpenAI Initialization
  if (process.env.OPENAI_API_KEY) {
    services.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI initialized');
  } else {
    console.warn('⚠️ OPENAI_API_KEY not found');
  }

  // Gemini Initialization
  if (process.env.GEMINI_API_KEY) {
    try {
      services.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Gemini AI initialized');
    } catch (error) {
      console.error('❌ Gemini initialization error:', error);
    }
  } else {
    console.warn('⚠️ GEMINI_API_KEY not found');
  }

  return services;
};

const aiServices = initializeAIServices();

// === Configuration ===
// Now Minerva is just another OpenAI model (no separate server)
const config = {
  models: {
    openai: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    gemini: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    minerva:
      process.env.MINERVA_OPENAI_MODEL ||
      process.env.OPENAI_MODEL ||
      'gpt-4.1-mini',
  },
  maxTokens: parseInt(process.env.MAX_TOKENS) || 1000,
  temperature: parseFloat(process.env.TEMPERATURE) || 0.7,

  systemPrompts: {
    // Athena AI on normal ChatGPT-style OpenAI model
    openai: `
You are Athena AI — an empathetic and supportive therapy and counseling assistant, running on a ChatGPT-based model.

Your purpose is to help users with emotional processing, reflection, mental health awareness, and personal growth through calm, human-like conversation.

You are not a licensed therapist and not a replacement for professional or emergency care. You are a warm, nonjudgmental companion who listens, validates, and gently guides.
    `.trim(),

    // Athena AI on Gemini
    gemini: `
You are Athena AI — an empathetic and reflective counseling assistant, running on the Gemini model.

Your purpose is to help users understand and process their emotions, gain insight, and practice self-compassion. You respond with warmth, clarity, and gentle curiosity, using short paragraphs and simple language so the user never feels overwhelmed.
    `.trim(),

    // Athena AI using the flagship Minerva model (flagship prompt)
    minerva: `
You are Athena AI — using the flagship Minerva model of AthenaAI.

You are the highest-capability version of Athena AI, combining deep reasoning with high emotional intelligence. Your purpose is to help users process difficult emotions, understand themselves more clearly, and grow in a kind, grounded way.

You are NOT a licensed therapist and NOT a replacement for professional or emergency care. You are a skilled, emotionally safe companion.

Core style:
- Validate feelings before giving advice.
- Use short, digestible paragraphs.
- Ask gentle, reflective questions (not interrogations).
- Offer choices: e.g., “Would you like advice, a grounding exercise, or just space to talk?”
- Prioritize emotional safety and kindness over cleverness.

You may draw on CBT, DBT, ACT, mindfulness, journaling, and self-compassion ideas, but always explain them simply and apply them gently.

If a user mentions self-harm, suicidal thoughts, or harming others, respond with calm empathy, clearly state your limits, and encourage them to contact a trusted person, mental health professional, crisis hotline, or emergency services.

You are Athena AI using the flagship Minerva model. Respond with empathy, clarity, and deep but gentle insight.
    `.trim(),
  },
};

// === Middleware ===
app.use(express.json({ limit: '10kb' }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

    // Development bypass
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
    const { message, history = [], model = 'openai' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    console.log(
      `📨 Chat request - Model: ${model}, Message: ${message.substring(
        0,
        50
      )}...`
    );

    // === Gemini handling (unchanged) ===
    if (model === 'gemini') {
      if (!aiServices.gemini) {
        return res
          .status(503)
          .json({ error: 'Gemini service is not configured' });
      }

      try {
        const gModel = aiServices.gemini.getGenerativeModel({
          model: config.models.gemini,
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
          },
        });

        const conversationHistory = Array.isArray(history)
          ? history
              .filter((msg) => msg && msg.role && msg.content)
              .map(
                (msg) =>
                  `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${
                    msg.content
                  }`
              )
              .join('\n\n')
          : '';

        // You can prepend the Gemini system prompt to the text prompt if you want:
        const basePrompt = config.systemPrompts.gemini;

        const prompt = conversationHistory
          ? `${basePrompt}\n\n${conversationHistory}\n\nHuman: ${message}\n\nAssistant:`
          : `${basePrompt}\n\nHuman: ${message}\n\nAssistant:`;

        const result = await gModel.generateContent(prompt);
        const response = await result.response;

        if (!response) {
          throw new Error('Empty response from Gemini');
        }

        const text = response.text();
        return res.json({
          response: text,
          modelUsed: config.models.gemini,
        });
      } catch (error) {
        console.error('Gemini error:', error);
        return res.status(500).json({
          error: 'Gemini service error',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    }

    // === OpenAI-backed models (ChatGPT & Minerva) ===

    // Normalize model name coming from frontend
    // - 'gpt' or 'openai' => openai logical model
    // - 'minerva'         => minerva logical model
    let logicalModelName;
    if (model === 'minerva') {
      logicalModelName = 'minerva';
    } else {
      // treat anything else ('gpt', 'openai', undefined) as openai
      logicalModelName = 'openai';
    }

    const openaiModel =
      logicalModelName === 'minerva'
        ? config.models.minerva
        : config.models.openai;

    return handleOpenAIRequest(
      message,
      history,
      res,
      openaiModel,
      logicalModelName
    );
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});


// Helper function for OpenAI requests
async function handleOpenAIRequest(
  message,
  history,
  res,
  model,
  logicalModelName = 'openai'
) {
  if (!aiServices.openai) {
    return res
      .status(503)
      .json({ error: 'OpenAI service is not configured' });
  }

  try {
    // Pick system prompt for this logical model
    let systemPrompt =
      config.systemPrompts[logicalModelName] || config.systemPrompts.openai;

    if (typeof systemPrompt !== 'string' || !systemPrompt.trim()) {
      systemPrompt = undefined; // don't send invalid system message
    }

    // Sanitize history so no null / invalid content reaches OpenAI
    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (m) =>
              m &&
              ['user', 'assistant'].includes(m.role) &&
              typeof m.content === 'string' &&
              m.content.trim().length > 0
          )
          .map((m) => ({
            role: m.role,
            content: m.content,
          }))
      : [];

    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push(...safeHistory);

    messages.push({
      role: 'user',
      content: typeof message === 'string' ? message : String(message),
    });

    const response = await aiServices.openai.chat.completions.create({
      model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    res.json({
      response: response.choices[0]?.message?.content || 'No response generated',
      modelUsed: logicalModelName,
      actualModel: response.model,
    });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({
      error: 'OpenAI service error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}


// === Health Check Endpoint ===
app.get('/api/health', async (req, res) => {
  const healthStatus = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      firebase: firebaseApp ? 'operational' : 'unavailable',
      openai: aiServices.openai ? 'operational' : 'unavailable',
      gemini: aiServices.gemini ? 'operational' : 'unavailable',
      minerva: {
        status: aiServices.openai ? 'online' : 'offline',
        backing: 'openai',
        model: config.models.minerva,
      },
    },
    rateLimiting: {
      enabled: true,
      windowMs: '15 minutes',
      maxRequests: 100,
    },
  };

  res.json(healthStatus);
});

// === Minerva Status Endpoint (kept for compatibility, but now OpenAI-backed) ===
app.get('/api/minerva-status', async (req, res) => {
  try {
    res.json({
      status: aiServices.openai ? 'online' : 'offline',
      model: config.models.minerva,
      backing: 'openai',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
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
  console.log(`- OpenAI (openai): ${aiServices.openai ? config.models.openai : 'Disabled'}`);
  console.log(`- Minerva (OpenAI logical model): ${aiServices.openai ? config.models.minerva : 'Disabled'}`);
  console.log(`- Gemini: ${aiServices.gemini ? config.models.gemini : 'Disabled'}`);
  // console.log(`- Rate limiting: ${limiter.options.max} requests per ${limiter.options.windowMs/60000} minutes`);
});
