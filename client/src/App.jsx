import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/login';
import Chat from './pages/chat/chat';
import Notes from './pages/notes/notes';
import NoteEditor from './pages/notes/NoteEditor';
import Calendar from './pages/Calendar/Calendar';
import TaskManager from './pages/TaskManager/Task';
import Profile from './pages/profile/profile.jsx';
import Settings from './pages/settings/settings.jsx';
import CodeEditor from "./pages/CodeEditor/CodeEditor.jsx"; // Fixed import path
import './App.css';
import MindMapInterface from './components/MindMapInterface.JSX';
import YudleFeedbackForm from './components/YudleFeedbackForm.jsx';
import { auth } from './firebase.js';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const isLoggedIn = !!user;
      setIsAuthenticated(isLoggedIn);
      localStorage.setItem('isLoggedIn', isLoggedIn.toString());
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={
            isAuthenticated ? 
              <Navigate to="/chat" replace /> : 
              <Login setIsAuthenticated={setIsAuthenticated} />
          } />

          <Route path="/chat" element={
            isAuthenticated ? 
              <Chat /> : 
              <Navigate to="/login" state={{ from: '/chat' }} replace />
          } />

          <Route path="/notes" element={
            isAuthenticated ? 
              <Notes /> : 
              <Navigate to="/login" replace />
          } />

          <Route path="/calendar" element={
            isAuthenticated ? 
              <Calendar /> : 
              <Navigate to="/login" replace />
          } />

          <Route path="/tasks" element={
            isAuthenticated ? 
              <TaskManager /> : 
              <Navigate to="/login" replace />
          } />

          <Route path="/notes/:noteId" element={
            isAuthenticated ? 
              <NoteEditor /> : 
              <Navigate to="/login" replace />
          } />

          {/* Add the Code Editor route */}
          <Route path="/code-editor" element={
            isAuthenticated ? 
              <CodeEditor /> : 
              <Navigate to="/login" replace />
          } />

          <Route path="/profile" element={
            isAuthenticated ? 
              <Profile /> : 
              <Navigate to="/login" replace />
          } />

          <Route path="/settings" element={
            isAuthenticated ? 
              <Settings /> : 
              <Navigate to="/login" replace />
          } />
          <Route path="/feedback" element={
            isAuthenticated ? 
              <YudleFeedbackForm /> : 
              <Navigate to="/login" replace />
          } />
          <Route path="/mindmap" element={
            isAuthenticated ? 
              <MindMapInterface /> : 
              <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/chat" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;