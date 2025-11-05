import React, { useState } from 'react';
import {
  Container, Box, TextField, Button, CircularProgress,
  Alert, Paper, Typography
} from '@mui/material';
import { createPost } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Create({ user, onPostCreated }) {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim()) {
      setError('Caption is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      let imageData = null;
      if (image) {
        imageData = await convertImageToBase64(image);
      }

      const response = await createPost({
        caption: caption.trim(),
        image: imageData
      });

      setCaption('');
      setImage(null);
      setImagePreview(null);
      setSuccess('Post created successfully!');

      if (onPostCreated) {
        onPostCreated(response.data);
      }

      setTimeout(() => navigate('/'), 2000);
      setLoading(false);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Error creating post');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          Create Post
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

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="What's on your mind?"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 3 }}
            disabled={loading}
            error={error && !caption.trim()}
          />

          {imagePreview && (
            <Box sx={{ mb: 3, position: 'relative' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} 
              />
              <Button
                size="small"
                color="error"
                onClick={() => { setImage(null); setImagePreview(null); }}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                Remove Image
              </Button>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="image-input"
              disabled={loading}
            />
            <label htmlFor="image-input">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                {imagePreview ? 'Change Image' : 'Add Image'}
              </Button>
            </label>
          </Box>

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading || !caption.trim()}
            sx={{ background: '#667eea', textTransform: 'none', py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              'Post'
            )}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Create;