import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { 
  auth, 
  provider, 
  signInWithPopup
} from '../../config/firebase.js';
import { syncUserProfile } from '../../services/authService';
import logoLight from '../../assets/logo-01.png';
import aiLogo from '../../assets/logo-07.png';
import budhaImage from '../../assets/budha.png'; // Import the budha.png image

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const CORRECT_EMAIL = 'admin@yudle.com'; 
  const CORRECT_PASSWORD = "Sai_Ani_Sur_2006_2025";

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) {
        throw new Error('Authentication failed');
      }

      // Creates/updates users/{uid} on the server. Not fatal: sign-in has already succeeded.
      try {
        await syncUserProfile();
      } catch (profileError) {
        console.error('User profile sync failed:', profileError);
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
            <h1>Athena AI</h1>
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
              href="#"
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

      {/* Right Side - Buddha Image Display */}
      <div className="showcase-section">
        <div className="image-display-container">
          <img 
            src={budhaImage} 
            alt="Buddha" 
            className="budha-image"
          />
          <div className="image-caption">
            <h3>Welcome to Athena AI</h3>
            <p>Experience wisdom and intelligence combined</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;