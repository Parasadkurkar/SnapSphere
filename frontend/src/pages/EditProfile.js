import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { updateProfile } from '../services/api';

function EditProfile({ user, onProfileUpdate }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profilePic: user?.profilePic || ''
  });
  const [preview, setPreview] = useState(user?.profilePic || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profilePic: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!formData.name.trim()) {
        setError('Name is required');
        return;
      }

      setLoading(true);
      console.log('Sending profile update request...');

      const response = await updateProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        profilePic: formData.profilePic
      });

      console.log('Profile update response:', response);
      setSuccess('Profile updated successfully!');
      
      if (onProfileUpdate && response.data.user) {
        onProfileUpdate(response.data.user);
      }

      // Redirect to home (SAFE - doesn't use user.id)
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error updating profile';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');  // Go to home instead of profile
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          Edit Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar src={preview} sx={{ width: 100, height: 100 }} />
            <input
              accept="image/*"
              hidden
              id="profile-pic-input"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="profile-pic-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                sx={{ borderColor: '#667eea', color: '#667eea' }}
              >
                Change Photo
              </Button>
            </label>
          </Box>

          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            required
            disabled={loading}
          />

          <TextField
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
            disabled={loading}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
              sx={{ background: '#667eea' }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditProfile;
