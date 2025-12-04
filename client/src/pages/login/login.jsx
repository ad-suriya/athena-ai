import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { 
  auth, 
  provider, 
  signInWithPopup, 
  db, 
  doc, 
  setDoc,
  getDoc,
  updateDoc
} from '../../firebase.js';
import logoLight from '../../assets/logo-01.png';
import aiLogo from '../../assets/logo-07.png';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUseCaseIndex, setCurrentUseCaseIndex] = useState(0);
  const navigate = useNavigate();

  const CORRECT_EMAIL = 'admin@yudle.com'; 
  const CORRECT_PASSWORD = "Sai_Ani_Sur_2006_2025";

  const contentExamples = [
    {
      title: "Sales Funnel Visualization",
      description: "Create visual representations of your sales data.",
      content: {
        user: "Hi yudle! Can you visualize my sales funnel from awareness to purchase using bar graphs?",
        response: "Here's your sales funnel.",
        chart: {
          title: "Sales funnel",
          data: [
            { stage: "Ad view", value: 400, color: "#4F9CF9" },
            { stage: "Email open", value: 250, color: "#7DB46C" },
            { stage: "Website visit", value: 150, color: "#FFB84D" },
            { stage: "Product Demo", value: 100, color: "#B19CD9" },
            { stage: "Purchase", value: 50, color: "#FF6B8A" }
          ]
        }
      }
    },
    {
      title: "Code Optimization",
      description: "Identify code optimizations and performance improvements.",
      content: {
        user: "Identify code optimizations and performance improvements.",
        response: "All set. Here's the optimized code.",
        code: `import random

class Neuron:
    def __init__(self, num_inputs):
        self.weights = [random.random() for _ in range(num_inputs)]
        self.bias = random.random()
    
    def activate(self, inputs):
        activation = sum(w * i for w, i in zip(self.weights, inputs))
        return 1 / (1 + math.exp(-activation))

class NeuralNetwork:
    def __init__(self, num_inputs, num_hidden, num_outputs):
        self.hidden_layer = [Neuron(num_inputs) for _ in range(num_hidden)]`
      }
    },
    {
      title: "Content Calendar",
      description: "Create marketing content calendars and schedules.",
      content: {
        user: "yudle, make a content calendar for my marketing campaign.",
        response: "Of course. Here's the calendar!",
        calendar: {
          title: "Marketing Calendar",
          days: [
            { date: "2", day: "Mon", content: null },
            { date: "3", day: "Tue", content: { type: "Instagram", desc: "behind the scenes image + caption", color: "#E1306C" } },
            { date: "4", day: "Wed", content: { type: "Youtube", desc: "Product Tutorial Video", color: "#FF0000" } },
            { date: "5", day: "Thu", content: { type: "Blog", desc: "10 Tips for Productiveness", color: "#4285F4" } },
            { date: "6", day: "Fri", content: null },
            { date: "9", day: "Mon", content: null },
            { date: "10", day: "Tue", content: null },
            { date: "11", day: "Wed", content: { type: "LinkedIn", desc: "Product announcement", color: "#0077B5" } },
            { date: "12", day: "Thu", content: { type: "Newsletter", desc: "Monthly Recap Email Digest", color: "#FF6B35" } },
            { date: "13", day: "Fri", content: null },
            { date: "16", day: "Mon", content: null },
            { date: "17", day: "Tue", content: { type: "Instagram", desc: "Behind the scenes image + Caption", color: "#E1306C" } },
            { date: "18", day: "Wed", content: null },
            { date: "19", day: "Thu", content: null },
            { date: "20", day: "Fri", content: null },
            { date: "23", day: "Mon", content: null },
            { date: "24", day: "Tue", content: null },
            { date: "25", day: "Wed", content: null },
            { date: "26", day: "Thu", content: null },
            { date: "27", day: "Fri", content: null }
          ]
        }
      }
    }
  ];

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) {
        throw new Error('Authentication failed');
      }

      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        const userData = {
          uid: user.uid,
          name: user.displayName || "Anonymous",
          email: user.email || "no-email",
          photoURL: user.photoURL || "",
          lastLogin: new Date(),
          createdAt: new Date()
        };
        
        await setDoc(userRef, userData);
      } else {
        await updateDoc(userRef, { lastLogin: new Date() });
      }

      localStorage.setItem('isLoggedIn', 'true');
      setIsAuthenticated(true);
      navigate('/chat');

    } catch (error) {
      console.error('Google login error:', error);
      setErrorMessage(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Email and password are required');
      setIsLoading(false);
      return;
    }

    // Validate email contains @ symbol
    if (!trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address. @ symbol is required.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      if (trimmedEmail === CORRECT_EMAIL && trimmedPassword === CORRECT_PASSWORD) {
        localStorage.setItem('isLoggedIn', 'true');
        setIsAuthenticated(true);
        navigate('/chat');
      } else {
        setErrorMessage('Invalid email or password');
      }
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUseCaseIndex((prevIndex) => 
        prevIndex === contentExamples.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [contentExamples.length]);

  return (
    <div className="login-page">
      {/* Left Side - Login Form */}
      <div className="auth-section">
        <div className="brand-logo-container">
          <img 
            src={logoLight} 
            alt="Yudle Logo" 
            className="brand-logo"
          />
        </div>
        <div className="auth-container">
          <div className="auth-header">
            <h2>Log in to</h2>
            <h1>Yudle</h1>
          </div>

          <form onSubmit={handleLogin}>
            <button 
              type="button"
              className="google-login-btn"
              onClick={handleGoogleLogin} 
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="login-input"
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="login-input"
                disabled={isLoading}
              />
            </div>

            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="auth-footer">
            <a href="#" className="forgot-password">Forgot password?</a>
            <p className="signup-link">Don't have an account? <a href="#">Sign up</a></p>
            <a 
              href="https://yudle.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="learn-more-link"
            >
              Learn more
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Interactive Content Examples */}
      <div className="showcase-section">
        <div className="showcase-content">
          <div className="content-example-container">
            <div className="chat-message user-message">
              <div className="user-avatar">👤</div>
              <div className="message-content" style={{outline: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent'}}>
                {contentExamples[currentUseCaseIndex].content.user}
              </div>
            </div>
            
            <div className="chat-message ai-message">
              <div className="ai-avatar">
                <img src={aiLogo} alt="Yudle AI" className="ai-logo" />
              </div>
              <div className="message-content" style={{outline: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent'}}>
                <div className="response-text">{contentExamples[currentUseCaseIndex].content.response}</div>
                
                {contentExamples[currentUseCaseIndex].content.code && (
                  <div className="code-widget">
                    <pre><code>{contentExamples[currentUseCaseIndex].content.code}</code></pre>
                  </div>
                )}
                
                {contentExamples[currentUseCaseIndex].content.chart && (
                  <div className="chart-widget">
                    <h3>{contentExamples[currentUseCaseIndex].content.chart.title}</h3>
                    <div className="chart-container">
                      <div className="chart-bars">
                        {contentExamples[currentUseCaseIndex].content.chart.data.map((item, index) => (
                          <div key={index} className="chart-bar">
                            <div className="bar-value">{item.value}</div>
                            <div 
                              className="bar" 
                              style={{
                                height: `${(item.value / 400) * 120}px`,
                                backgroundColor: item.color
                              }}
                            ></div>
                            <div className="bar-label">{item.stage}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {contentExamples[currentUseCaseIndex].content.calendar && (
                  <div className="calendar-widget">
                    <div className="calendar-header">
                      <div className="calendar-day">Mon</div>
                      <div className="calendar-day">Tue</div>
                      <div className="calendar-day">Wed</div>
                      <div className="calendar-day">Thu</div>
                      <div className="calendar-day">Fri</div>
                    </div>
                    <div className="calendar-grid">
                      {contentExamples[currentUseCaseIndex].content.calendar.days.map((day, index) => (
                        <div key={index} className="calendar-cell">
                          <div className="calendar-date">{day.date}</div>
                          {day.content && (
                            <div className="calendar-event" style={{ backgroundColor: day.content.color }}>
                              <div className="event-type">{day.content.type}</div>
                              <div className="event-desc">{day.content.desc}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="content-indicators">
          {contentExamples.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentUseCaseIndex ? 'active' : ''}`}
              onClick={() => setCurrentUseCaseIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;