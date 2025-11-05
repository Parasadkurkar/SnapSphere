import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, List, ListItem, ListItemAvatar, Avatar,
  Typography, Button, CircularProgress, Chip, Alert
} from '@mui/material';
import { getNotifications, markNotificationAsRead, readAllNotifications, followUser, getCurrentUser } from '../services/api';

function Notifications({ user }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingFollow, setProcessingFollow] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    fetchNotifications();
    fetchCurrentUser();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchCurrentUser();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      setCurrentUser(response.data);

      // Build following status map
      if (response.data.following) {
        const status = {};
        response.data.following.forEach(userId => {
          const id = typeof userId === 'string' ? userId : userId._id;
          status[id] = true;
        });
        setFollowingStatus(status);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await readAllNotifications();
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleFollowBack = async (fromUserId, notificationId) => {
    try {
      setProcessingFollow({ ...processingFollow, [notificationId]: true });
      await followUser(fromUserId);
      await fetchCurrentUser();
      await markNotificationAsRead(notificationId);
      await fetchNotifications();
      setProcessingFollow({ ...processingFollow, [notificationId]: false });
    } catch (err) {
      console.error('Error following back:', err);
      setError('Failed to follow back');
      setProcessingFollow({ ...processingFollow, [notificationId]: false });
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'follow': return '👥';
      case 'follow_accepted': return '✅';
      case 'like': return '❤️';
      case 'comment': return '💬';
      default: return '📢';
    }
  };

  const getNotificationChipLabel = (type) => {
    switch(type) {
      case 'follow': return 'Follow';
      case 'follow_accepted': return 'Accepted';
      case 'like': return 'Like';
      case 'comment': return 'Comment';
      default: return 'Notification';
    }
  };

  const getNotificationChipColor = (type) => {
    switch(type) {
      case 'follow': return '#667eea';
      case 'follow_accepted': return '#4CAF50';
      case 'like': return '#FF5252';
      case 'comment': return '#FF9800';
      default: return '#667eea';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
        {notifications.filter(n => !n.read).length > 0 && (
          <Button size="small" onClick={handleMarkAllAsRead} sx={{ color: '#667eea', textTransform: 'none' }}>
            Mark all as read
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <List>
        {notifications.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: '#999', py: 5 }}>
            No notifications yet
          </Typography>
        ) : (
          notifications.map((notif) => {
            // Check if already following this user
            const fromUserId = notif.from?._id;
            const alreadyFollowing = followingStatus[fromUserId];

            return (
              <ListItem
                key={notif._id}
                sx={{
                  mb: 1, p: 2,
                  background: notif.read ? 'transparent' : '#f0f4ff',
                  borderRadius: '8px',
                  borderLeft: notif.read ? 'none' : '4px solid #667eea',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', mb: 1 }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={notif.from?.profilePic} 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${notif.from?._id}`)}
                    />
                  </ListItemAvatar>

                  <Box sx={{ flex: 1, ml: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: notif.read ? 400 : 600,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => navigate(`/profile/${notif.from?._id}`)}
                      >
                        {getNotificationIcon(notif.type)} {notif.from?.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        @{notif.from?.username}
                      </Typography>
                      <Chip 
                        label={getNotificationChipLabel(notif.type)} 
                        size="small" 
                        sx={{ 
                          background: getNotificationChipColor(notif.type), 
                          color: 'white',
                          height: '20px',
                          fontSize: '11px'
                        }} 
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#555', my: 0.5 }}>
                      {notif.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notif.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  width: '100%',
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap'
                }}>
                  {/* Show Follow Back button only for 'follow' notifications AND if not already following */}
                  {notif.type === 'follow' && !notif.read && !alreadyFollowing && (
                    <Button
                      size="small"
                      variant="contained"
                      disabled={processingFollow[notif._id]}
                      onClick={() => handleFollowBack(notif.from?._id, notif._id)}
                      sx={{ 
                        background: '#667eea',
                        textTransform: 'none',
                        fontSize: '13px',
                        '&:hover': { background: '#5568d3' }
                      }}
                    >
                      {processingFollow[notif._id] ? (
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                      ) : (
                        'Follow Back'
                      )}
                    </Button>
                  )}

                  {/* Show "Following" badge if already following */}
                  {notif.type === 'follow' && alreadyFollowing && (
                    <Chip 
                      label="Following" 
                      size="small"
                      sx={{ 
                        background: '#e0e0e0',
                        color: '#666',
                        fontSize: '12px'
                      }}
                    />
                  )}

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/profile/${notif.from?._id}`)}
                    sx={{ 
                      borderColor: '#667eea',
                      color: '#667eea',
                      textTransform: 'none',
                      fontSize: '13px'
                    }}
                  >
                    View Profile
                  </Button>

                  {!notif.read && (
                    <Button
                      size="small"
                      onClick={() => handleMarkAsRead(notif._id)}
                      sx={{ 
                        fontSize: '11px', 
                        textTransform: 'none',
                        color: '#999'
                      }}
                    >
                      Dismiss
                    </Button>
                  )}
                </Box>
              </ListItem>
            );
          })
        )}
      </List>
    </Container>
  );
}

export default Notifications;