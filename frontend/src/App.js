import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SetupProfile from './pages/SetupProfile';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import CreatePost from './pages/CreatePost';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (err) {
          console.error('Error parsing user from localStorage:', err);
          clearAuth();
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleLogout = () => {
    clearAuth();
  };

  const handleProfileUpdate = (updatedUser) => {
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Not logged in - show login page
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  // Logged in - show main app
  return (
    <Router>
      <Routes>
        {/* Setup profile for new users */}
        <Route 
          path="/setup-profile" 
          element={<SetupProfile user={user} onProfileUpdate={handleProfileUpdate} />} 
        />

        {/* Main app routes */}
        <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/search" element={<Search user={user} />} />
          <Route path="/create" element={<CreatePost user={user} />} />
          <Route path="/messages" element={<Messages user={user} />} />
          <Route path="/messages/:userId" element={<Messages user={user} />} />
          <Route path="/notifications" element={<Notifications user={user} />} />
          <Route 
            path="/profile/:userId" 
            element={<Profile user={user} onProfileUpdate={handleProfileUpdate} />} 
          />
          <Route 
            path="/edit-profile" 
            element={<EditProfile user={user} onProfileUpdate={handleProfileUpdate} />} 
          />
        </Route>
        
        

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;