require('dotenv').config();
const fetch = require('node-fetch');
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
  message: 'Too many requests from this IP, please try again later'
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
      databaseURL: process.env.FIREBASE_DATABASE_URL
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
    gemini: null
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

// === Middleware ===
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());

// === Configuration ===
const config = {
  models: {
    openai: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    gemini: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    minerva: {
      endpoint: process.env.MINERVA_ENDPOINT || 'http://localhost:8001',
      timeout: parseInt(process.env.MINERVA_TIMEOUT) || 30000,
      fallbackEnabled: process.env.MINERVA_FALLBACK === 'true',
      fallbackModel: 'gpt-3.5-turbo'
    }
  },
  maxTokens: parseInt(process.env.MAX_TOKENS) || 1000,
  temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
  systemPrompt: process.env.SYSTEM_PROMPT || 'You are a helpful assistant.'
};

// === Minerva Service ===
class MinervaService {
  constructor() {
    this.status = 'unknown';
    this.lastChecked = null;
  }

  async checkStatus() {
    try {
      const response = await fetch(`${config.models.minerva.endpoint}/health`, {
        timeout: 5000
      });
      
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      
      this.status = 'online';
      this.lastChecked = new Date();
      return true;
    } catch (error) {
      this.status = 'offline';
      this.lastChecked = new Date();
      console.warn('⚠️ Minerva service unavailable:', error.message);
      return false;
    }
  }

  async sendPrompt(prompt, history = []) {
    try {
      const minervaResponse = await fetch(`${config.models.minerva.endpoint}/minerva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          history // Include conversation history if your Minerva server supports it
        }),
        timeout: config.models.minerva.timeout
      });

      if (!minervaResponse.ok) {
        const errorText = await minervaResponse.text();
        throw new Error(`Minerva API error: ${errorText}`);
      }

      return await minervaResponse.json();
    } catch (error) {
      console.error('Minerva request failed:', error);
      throw error;
    }
  }
}

const minervaService = new MinervaService();

// Periodically check Minerva status (every 5 minutes)
setInterval(() => minervaService.checkStatus(), 5 * 60 * 1000);
minervaService.checkStatus(); // Initial check

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
          isDev: true
        } 
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
        emailVerified: userRecord.emailVerified
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    console.log(`📨 Chat request - Model: ${model}, Message: ${message.substring(0, 50)}...`);

    // === Minerva Handling ===
    if (model === 'minerva') {
      try {
        // Check Minerva status before proceeding
        const isMinervaOnline = await minervaService.checkStatus();
        
        if (!isMinervaOnline && !config.models.minerva.fallbackEnabled) {
          return res.status(503).json({ 
            error: 'Minerva service is currently offline',
            solution: 'Try again later or contact support'
          });
        }

        if (!isMinervaOnline && config.models.minerva.fallbackEnabled) {
          console.log('🔄 Falling back to OpenAI due to Minerva unavailability');
          return handleOpenAIRequest(message, history, res, config.models.minerva.fallbackModel);
        }

        console.log('🔮 Contacting Minerva...');
        const startTime = Date.now();
        
        const { response } = await minervaService.sendPrompt(message, history);
        
        console.log(`✅ Minerva response (${Date.now() - startTime}ms)`);
        return res.json({
          response,
          modelUsed: 'minerva-mistral-7b',
          isLocal: true
        });

      } catch (error) {
        console.error('Minerva error:', error);
        
        if (config.models.minerva.fallbackEnabled) {
          console.log('🔄 Falling back to OpenAI due to Minerva error');
          return handleOpenAIRequest(message, history, res, config.models.minerva.fallbackModel);
        }
        
        return res.status(503).json({ 
          error: 'Minerva service error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          solution: 'Try again later or use another model'
        });
      }
    }

    // === Gemini Handling ===
    if (model === 'gemini') {
      if (!aiServices.gemini) {
        return res.status(503).json({ error: 'Gemini service is not configured' });
      }

      try {
        const gModel = aiServices.gemini.getGenerativeModel({ 
          model: config.models.gemini,
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
          }
        });

        const conversationHistory = history
          .filter(msg => msg.role && msg.content)
          .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
          .join('\n\n');

        const prompt = conversationHistory 
          ? `${conversationHistory}\n\nHuman: ${message}\n\nAssistant:`
          : `Human: ${message}\n\nAssistant:`;

        const result = await gModel.generateContent(prompt);
        const response = await result.response;

        if (!response) {
          throw new Error('Empty response from Gemini');
        }

        const text = response.text();
        return res.json({ 
          response: text, 
          modelUsed: config.models.gemini 
        });

      } catch (error) {
        console.error('Gemini error:', error);
        return res.status(500).json({ 
          error: 'Gemini service error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    // === Default: OpenAI Handling ===
    return handleOpenAIRequest(message, history, res, config.models.openai);

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function for OpenAI requests
async function handleOpenAIRequest(message, history, res, model) {
  if (!aiServices.openai) {
    return res.status(503).json({ error: 'OpenAI service is not configured' });
  }

  try {
    const messages = [
      { role: 'system', content: config.systemPrompt },
      ...history.filter(m => ['user', 'assistant'].includes(m.role)),
      { role: 'user', content: message },
    ];

    const response = await aiServices.openai.chat.completions.create({
      model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    res.json({
      response: response.choices[0]?.message?.content || 'No response generated',
      modelUsed: response.model,
    });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ 
      error: 'OpenAI service error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        status: minervaService.status,
        lastChecked: minervaService.lastChecked,
        endpoint: config.models.minerva.endpoint,
        fallback: config.models.minerva.fallbackEnabled ? 
          `enabled (${config.models.minerva.fallbackModel})` : 'disabled'
      }
    },
    rateLimiting: {
      enabled: true,
      windowMs: '15 minutes',
      maxRequests: 100
    }
  };

  res.json(healthStatus);
});

// === Minerva Status Endpoint ===
app.get('/api/minerva-status', async (req, res) => {
  try {
    const isOnline = await minervaService.checkStatus();
    res.json({
      status: isOnline ? 'online' : 'offline',
      lastChecked: minervaService.lastChecked,
      endpoint: config.models.minerva.endpoint,
      fallback: config.models.minerva.fallbackEnabled,
      fallbackModel: config.models.minerva.fallbackModel
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// === Error Handlers ===
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// === Server Startup ===
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log('🛡️ Security middleware enabled');
  console.log('🤖 Available AI Services:');
  console.log(`- OpenAI: ${aiServices.openai ? config.models.openai : 'Disabled'}`);
  console.log(`- Gemini: ${aiServices.gemini ? config.models.gemini : 'Disabled'}`);
  console.log(`- Minerva: ${config.models.minerva.endpoint} (Fallback: ${config.models.minerva.fallbackEnabled ? 'Enabled' : 'Disabled'})`);
  // console.log(`- Rate limiting: ${limiter.options.max} requests per ${limiter.options.windowMs/60000} minutes`);
});