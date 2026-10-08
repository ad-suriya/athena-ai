import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import Chat from './features/conversations/Chat';
import Notes from './features/notes/Notes';
import NoteEditor from './features/notes/NoteEditor';
import Calendar from './features/calendar/Calendar';
import TaskManager from './features/tasks/Task';
import Profile from './pages/profile/Profile.jsx';
import Settings from './pages/settings/Settings.jsx';
import CodeEditor from "./pages/code-editor/CodeEditor.jsx"; // Fixed import path
import './App.css';
import MindMap from './features/mindmap/MindMapInterface.jsx';
import YudleFeedbackForm from './pages/feedback/YudleFeedbackForm.jsx';
import { auth } from './config/firebase.js';

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
              <MindMap /> : 
              <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/chat" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;