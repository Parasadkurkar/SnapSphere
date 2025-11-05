import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { register, login } from '../services/api';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setError('All fields are required!');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await register({ name, email, username, password });

      console.log('Register response:', response.data);

      // SAVE TO LOCALSTORAGE
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccess('Registration successful!');
      setLoading(false);

      // FORCE RELOAD to /setup-profile
      setTimeout(() => {
        window.location.href = '/setup-profile';
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Register error:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password });

      console.log('Login response:', response.data);

      // SAVE TO LOCALSTORAGE
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccess('Login successful!');
      setLoading(false);

      // FORCE RELOAD to home
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed');
      console.error('Login error:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card sx={{ p: 3, borderRadius: '12px', width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ fontSize: '32px', mb: 1 }}>📸</Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>InstaPost</Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>Share Your Moments</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isRegister && (
              <>
                <TextField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                />
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                  helperText="Minimum 3 characters"
                />
              </>
            )}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : (isRegister ? 'Register' : 'Login')}
            </Button>

            <Button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
              variant="text"
              fullWidth
              disabled={loading}
            >
              {isRegister ? 'Already have account? Login' : "Don't have account? Register"}
            </Button>
          </Box>
        </form>
      </Card>
    </Container>
  );
}

export default Login;