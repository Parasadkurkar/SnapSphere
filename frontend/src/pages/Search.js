import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, TextField, List, ListItem, ListItemAvatar,
  Avatar, Typography, Button, CircularProgress, InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { searchUsers, followUser, getCurrentUser } from '../services/api';

function Search({ user }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [processingFollow, setProcessingFollow] = useState({});
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    fetchCurrentUser();
    const interval = setInterval(fetchCurrentUser, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => handleSearch(), 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      setCurrentUser(response.data);
      if (response.data.following) {
        const status = {};
        response.data.following.forEach(userId => {
          status[typeof userId === 'string' ? userId : userId._id] = true;
        });
        setFollowingStatus(status);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await searchUsers(searchQuery);
      const filteredResults = response.data.filter(
        searchUser => searchUser._id !== user?.id
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      setProcessingFollow({ ...processingFollow, [userId]: true });
      const response = await followUser(userId);
      if (response.data.following !== undefined) {
        setFollowingStatus({
          ...followingStatus,
          [userId]: response.data.following
        });
      }
      await fetchCurrentUser();
      setProcessingFollow({ ...processingFollow, [userId]: false });
    } catch (err) {
      console.error('Error following user:', err);
      setProcessingFollow({ ...processingFollow, [userId]: false });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Search Users
      </Typography>

      <TextField
        fullWidth
        placeholder="Search by name or username..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#999' }} />
            </InputAdornment>
          )
        }}
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && searchResults.length > 0 && (
        <List>
          {searchResults.map((searchUser) => {
            const isFollowing = followingStatus[searchUser._id];
            const isProcessing = processingFollow[searchUser._id];

            return (
              <ListItem
                key={searchUser._id}
                sx={{
                  mb: 1, p: 2, background: '#f9f9f9',
                  borderRadius: '12px', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <Box 
                  sx={{ display: 'flex', alignItems: 'center', gap: 2,
                       cursor: 'pointer', flex: 1 }}
                  onClick={() => navigate(`/profile/${searchUser._id}`)}
                >
                  <ListItemAvatar>
                    <Avatar src={searchUser.profilePic} sx={{ width: 50, height: 50 }} />
                  </ListItemAvatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {searchUser.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      @{searchUser.username}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  disabled={isProcessing}
                  onClick={() => handleFollow(searchUser._id)}
                  sx={{
                    background: isFollowing ? '#999' : '#667eea',
                    textTransform: 'none', minWidth: '90px',
                    '&:hover': { background: isFollowing ? '#777' : '#5568d3' }
                  }}
                >
                  {isProcessing ? (
                    <CircularProgress size={16} sx={{ color: 'white' }} />
                  ) : (
                    isFollowing ? 'Following' : 'Follow'
                  )}
                </Button>
              </ListItem>
            );
          })}
        </List>
      )}

      {!loading && searchQuery.trim() && searchResults.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body2" sx={{ color: '#999' }}>
            No users found for "{searchQuery}"
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default Search;