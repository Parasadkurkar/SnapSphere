import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography, Alert } from '@mui/material';
import { getPosts } from '../services/api';
import PostCard from '../components/PostCard';

function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
    // Auto-refresh feed every 5 seconds
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('Fetching feed posts...');
      const response = await getPosts();
      console.log('Posts fetched:', response.data);

      if (Array.isArray(response.data)) {
        setPosts(response.data);
        setError('');
      } else {
        setPosts([]);
        setError('Invalid posts format');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.response?.data?.message || 'Error loading feed. Make sure you are following users.');
      setPosts([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {error && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              Your feed is empty
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Follow users to see their posts in your feed
            </Typography>
          </Box>
        ) : (
          posts.map((post) => {
            try {
              return (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onUpdate={fetchPosts}
                />
              );
            } catch (err) {
              console.error('Error rendering post:', post._id, err);
              return null;
            }
          })
        )}
      </Box>
    </Container>
  );
}

export default Home;