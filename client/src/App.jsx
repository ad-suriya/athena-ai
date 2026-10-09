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
import './App.css';
import MindMap from './features/mindmap/MindMapInterface.jsx';
import YudleFeedbackForm from './pages/feedback/YudleFeedbackForm.jsx';
import { auth } from './config/firebase.js';
import AppShell from './components/layout/AppShell';
import Home from './features/home/Home';

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
          <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />
          <Route path="/login" element={
            isAuthenticated ?
              <Navigate to="/home" replace /> :
              <Login setIsAuthenticated={setIsAuthenticated} />
          } />

          {/* Signed-in pages share the app shell (sidebar + top bar). */}
          <Route element={isAuthenticated ? <AppShell /> : <Navigate to="/login" replace />}>
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/tasks" element={<TaskManager />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/:noteId" element={<NoteEditor />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/mindmap" element={<MindMap />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feedback" element={<YudleFeedbackForm />} />
          </Route>

          <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;