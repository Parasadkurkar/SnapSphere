import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  Typography,
  Button,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import { updateProfile } from '../services/api';

function SetupProfile({ user }) {
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // If no user, user is not logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      console.log('No token or user, redirecting to login');
      window.location.href = '/';
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await updateProfile({ profilePic });
      const updatedUser = result.data.user;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Profile photo saved!');
      setLoading(false);

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Error saving profile photo');
      console.error('Save error:', err);
    }
  };

  const handleSkip = () => {
    window.location.href = '/';
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', py: 4 }}>
      <Card sx={{ p: 4, borderRadius: '12px', width: '100%', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          Welcome, {user.name}! 🎉
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          Set up your profile picture (optional)
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Avatar 
            src={profilePic} 
            sx={{ 
              width: 120, 
              height: 120,
              border: '4px solid #667eea'
            }} 
          />

          <Button
            component="label"
            variant="outlined"
            disabled={loading}
            sx={{ 
              borderRadius: '8px',
              borderColor: '#667eea',
              color: '#667eea'
            }}
          >
            📷 Choose Photo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
          </Button>

          <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSave}
              disabled={loading}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Photo'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={handleSkip}
              disabled={loading}
            >
              Skip
            </Button>
          </Box>

          <Typography variant="caption" sx={{ color: '#999', mt: 2 }}>
            You can change this later in profile settings
          </Typography>
        </Box>
      </Card>
    </Container>
  );
}

export default SetupProfile;