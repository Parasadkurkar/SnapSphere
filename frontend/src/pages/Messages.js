import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, List, ListItem, ListItemAvatar, Avatar,
  Typography, TextField, Button, CircularProgress, Alert, Paper,
  InputAdornment, Badge
} from '@mui/material';
import { Send, Search as SearchIcon } from '@mui/icons-material';
import { getConversations, getConversation, sendMessage, getCurrentUser } from '../services/api';

function Messages({ user }) {
  const navigate = useNavigate();
  const { userId: messageUserId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFollowers, setFilteredFollowers] = useState([]);

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      setError('Please login first');
      return;
    }
    fetchCurrentUser();
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (messageUserId && mutualFollowers.length > 0 && !selectedConversation) {
      const foundUser = mutualFollowers.find(follower => {
        const followerId = typeof follower === 'string' ? follower : follower._id;
        return followerId === messageUserId;
      });

      if (foundUser) {
        handleSelectFromSearch(foundUser);
      }
    }
    // eslint-disable-next-line
  }, [messageUserId, mutualFollowers]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFollowers([]);
      return;
    }

    const filtered = mutualFollowers.filter(follower => {
      const name = follower.name?.toLowerCase() || '';
      const username = follower.username?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return name.includes(query) || username.includes(query);
    });

    setFilteredFollowers(filtered);
  }, [searchQuery, mutualFollowers]);

  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      setCurrentUser(response.data);

      if (response.data.following && response.data.followers) {
        const followingIds = response.data.following.map(u => 
          typeof u === 'string' ? u : u._id
        );
        const followerIds = response.data.followers.map(u => 
          typeof u === 'string' ? u : u._id
        );

        const mutualIds = followingIds.filter(id => followerIds.includes(id));

        const mutualUsers = response.data.following.filter(user => {
          const userId = typeof user === 'string' ? user : user._id;
          return mutualIds.includes(userId);
        });

        setMutualFollowers(mutualUsers);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response.data || []);
      setError('');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.response?.data?.message || 'Error loading messages');
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation);
      setSearchQuery('');
      const otherUserId = conversation.sender._id === user.id 
        ? conversation.receiver._id 
        : conversation.sender._id;

      const response = await getConversation(otherUserId);
      if (response.data.messages) {
        setMessages(response.data.messages);
      }
      setError('');
      fetchConversations();
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err.response?.data?.message || 'Cannot open this conversation');
      setSelectedConversation(null);
    }
  };

  const handleSelectFromSearch = async (follower) => {
    try {
      const followerId = typeof follower === 'string' ? follower : follower._id;
      const response = await getConversation(followerId);

      if (response.data.conversation) {
        setSelectedConversation(response.data.conversation);
        setMessages(response.data.messages || []);
      }
      setSearchQuery('');
      setError('');
      fetchConversations();
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err.response?.data?.message || 'Cannot open this conversation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const otherUserId = selectedConversation.sender._id === user.id 
        ? selectedConversation.receiver._id 
        : selectedConversation.sender._id;

      const response = await sendMessage({
        receiverId: otherUserId,
        text: newMessage.trim()
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
      fetchConversations();
      setSending(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Cannot send message');
      setSending(false);
    }
  };

  const otherUser = selectedConversation 
    ? selectedConversation.sender._id === user.id 
      ? selectedConversation.receiver 
      : selectedConversation.sender
    : null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', gap: 2, p: 2 }}>
      {/* Conversations Panel */}
      <Paper sx={{ 
        width: '350px', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        overflow: 'hidden' 
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', p: 2, borderBottom: '1px solid #e0e0e0' }}>
          Messages
        </Typography>

        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            placeholder="Search followers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#999' }} />
                </InputAdornment>
              )
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: '20px',
                fontSize: '14px'
              } 
            }}
          />
        </Box>

        {searchQuery.trim() && filteredFollowers.length > 0 && (
          <Box sx={{ borderBottom: '1px solid #e0e0e0', background: '#f9f9f9' }}>
            <Typography variant="caption" sx={{ p: 1, pl: 2, color: '#999', fontWeight: 'bold', display: 'block' }}>
              SEARCH RESULTS
            </Typography>
            <List sx={{ py: 0, maxHeight: '300px', overflow: 'auto' }}>
              {filteredFollowers.map((follower) => {
                const followerId = typeof follower === 'string' ? follower : follower._id;
                return (
                  <ListItem
                    key={followerId}
                    button
                    onClick={() => handleSelectFromSearch(follower)}
                    sx={{
                      p: 1.5,
                      borderBottom: '1px solid #e0e0e0',
                      '&:hover': { background: '#f0f0f0' }
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: '40px' }}>
                      <Avatar 
                        src={follower.profilePic} 
                        sx={{ width: 32, height: 32 }}
                      />
                    </ListItemAvatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                        {follower.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999', fontSize: '11px' }}>
                        @{follower.username}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {searchQuery.trim() && filteredFollowers.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center', color: '#999' }}>
            <Typography variant="caption">
              No followers found
            </Typography>
          </Box>
        )}

        {!searchQuery.trim() && (
          <>
            {conversations.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>
                  No conversations yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ overflow: 'auto', flex: 1 }}>
                {conversations.map((conversation) => {
                  const otherUser = conversation.sender._id === user.id 
                    ? conversation.receiver 
                    : conversation.sender;

                  const unreadCount = conversation.unreadCount || 0;

                  return (
                    <ListItem
                      key={conversation._id}
                      button
                      selected={selectedConversation?._id === conversation._id}
                      onClick={() => handleSelectConversation(conversation)}
                      sx={{
                        borderBottom: '1px solid #e0e0e0',
                        p: 1.5,
                        '&:hover': { background: '#f5f5f5' },
                        '&.Mui-selected': { background: '#e3f2fd' },
                        background: unreadCount > 0 ? '#fff3e0' : 'transparent'
                      }}
                    >
                      <ListItemAvatar>
                        <Badge 
                          badgeContent={unreadCount} 
                          color="error"
                          sx={{
                            '& .MuiBadge-badge': {
                              background: '#ff4444',
                              color: 'white',
                              fontSize: '11px'
                            }
                          }}
                        >
                          <Avatar src={otherUser.profilePic} />
                        </Badge>
                      </ListItemAvatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: unreadCount > 0 ? 'bold' : 'normal'
                          }}
                        >
                          {otherUser.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          @{otherUser.username}
                        </Typography>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </>
        )}
      </Paper>

      {/* Chat Panel */}
      <Paper sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        overflow: 'hidden' 
      }}>
        {selectedConversation && otherUser ? (
          <>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid #e0e0e0', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2 
            }}>
              <Avatar 
                src={otherUser.profilePic} 
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${otherUser._id}`)}
              />
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body1" 
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${otherUser._id}`)}
                >
                  {otherUser.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  @{otherUser.username}
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ m: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              gap: 1
            }}>
              {messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              ) : (
                messages.map((msg) => (
                  <Box
                    key={msg._id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender._id === user.id ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '60%',
                        p: 1.5,
                        borderRadius: '12px',
                        background: msg.sender._id === user.id ? '#667eea' : '#f0f0f0',
                        color: msg.sender._id === user.id ? 'white' : '#000'
                      }}
                    >
                      <Typography variant="body2">
                        {msg.text}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          mt: 0.5,
                          opacity: 0.7
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            <Box 
              component="form" 
              onSubmit={handleSendMessage}
              sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}
            >
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                multiline
                maxRows={3}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '20px' 
                  } 
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={sending || !newMessage.trim()}
                sx={{ 
                  background: '#667eea',
                  minWidth: '60px',
                  borderRadius: '20px'
                }}
              >
                {sending ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Send />}
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2
          }}>
            <Typography variant="body1" sx={{ color: '#999' }}>
              Select a conversation to start messaging
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Messages;