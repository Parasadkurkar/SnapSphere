import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Avatar, Typography, Button, CircularProgress, Dialog, Alert, Chip } from '@mui/material';
import { getUser, getUserPosts, followUser } from '../services/api';
import PostCard from '../components/PostCard';
import EditProfile from './EditProfile';

function Profile({ user, onProfileUpdate }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [followsMe, setFollowsMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [processingFollow, setProcessingFollow] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError('No user ID provided');
      setLoading(false);
      return;
    }
    fetchUserData();
    // eslint-disable-next-line
  }, [userId, user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      const userResponse = await getUser(userId);

      if (!userResponse.data) {
        setError('User not found');
        setLoading(false);
        return;
      }

      setProfileUser(userResponse.data);

      // Fetch user posts
      try {
        const postsResponse = await getUserPosts(userId);
        if (Array.isArray(postsResponse.data)) {
          setPosts(postsResponse.data);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPosts([]);
      }

      // Check if current user is following this profile
      if (userResponse.data.followers && user?.id) {
        const isFollowing = userResponse.data.followers.some(f => 
          (typeof f === 'string' ? f : f._id) === user.id
        );
        setFollowing(isFollowing);
      }

      // Check if this profile user is following current user (follows me)
      if (userResponse.data.following && user?.id) {
        const doesFollowMe = userResponse.data.following.some(f => 
          (typeof f === 'string' ? f : f._id) === user.id
        );
        setFollowsMe(doesFollowMe);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.message || 'Failed to load user');
      setProfileUser(null);
      setPosts([]);
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setProcessingFollow(true);
      const response = await followUser(userId);

      if (response.data.following !== undefined) {
        setFollowing(response.data.following);
      } else {
        setFollowing(!following);
      }

      await fetchUserData();
      setProcessingFollow(false);
    } catch (err) {
      console.error('Error following user:', err);
      setError(err.response?.data?.message || 'Failed to follow user');
      setProcessingFollow(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profileUser) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error || 'User not found'}
        </Alert>
      </Container>
    );
  }

  const isOwnProfile = user?.id === userId;

  // --- ADD: true if both follow each other
  const isMutual = following && followsMe && !isOwnProfile;

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Profile Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, background: '#f9f9f9', borderRadius: '12px' }}>
        <Avatar 
          src={profileUser.profilePic} 
          sx={{ width: 80, height: 80, cursor: 'pointer' }} 
          onClick={() => setShowAvatar(true)}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {profileUser.name}
            </Typography>
            {/* Show "Follows You" badge if they follow you */}
            {!isOwnProfile && followsMe && (
              <Chip 
                label="Follows You" 
                size="small" 
                sx={{ 
                  background: '#e8f0ff',
                  color: '#667eea',
                  fontSize: '11px',
                  height: '22px'
                }}
              />
            )}
          </Box>

          <Typography variant="body2" sx={{ color: '#666' }}>
            @{profileUser.username}
          </Typography>
          <Typography variant="body2" sx={{ my: 1, color: '#555' }}>
            {profileUser.bio || 'No bio yet'}
          </Typography>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2, my: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                {posts.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>Posts</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                {profileUser.followers?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>Followers</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                {profileUser.following?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>Following</Typography>
            </Box>
          </Box>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {!isOwnProfile && (
              <>
                {/* Follow / Follow Back button */}
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleFollow}
                  disabled={processingFollow}
                  sx={{ 
                    background: following ? '#999' : '#667eea',
                    textTransform: 'none',
                    '&:hover': { 
                      background: following ? '#777' : '#5568d3' 
                    }
                  }}
                >
                  {processingFollow ? (
                    <CircularProgress size={16} sx={{ color: 'white' }} />
                  ) : (
                    following ? 'Following' : (followsMe ? 'Follow Back' : 'Follow')
                  )}
                </Button>

                {/* MESSAGE BUTTON - Only for mutual followers */}
                {isMutual && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/messages/${userId}`)}
                    sx={{ 
                      borderColor: '#667eea',
                      color: '#667eea',
                      textTransform: 'none',
                      '&:hover': { background: '#f0f4ff' }
                    }}
                  >
                    💬 Message
                  </Button>
                )}
              </>
            )}

            {isOwnProfile && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setShowEdit(true)}
                sx={{ 
                  borderColor: '#667eea', 
                  color: '#667eea',
                  textTransform: 'none'
                }}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Avatar Dialog */}
      <Dialog open={showAvatar} onClose={() => setShowAvatar(false)} maxWidth="xs">
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Avatar src={profileUser.profilePic} sx={{ width: 240, height: 240 }} />
        </Box>
      </Dialog>

      {/* Edit Profile Dialog */}
      {showEdit && (
        <Dialog open={showEdit} onClose={() => setShowEdit(false)}>
          <Box sx={{ p: 2, minWidth: '400px' }}>
            <EditProfile 
              user={profileUser} 
              onProfileUpdate={(updated) => {
                setProfileUser(updated);
                if (isOwnProfile) {
                  onProfileUpdate(updated);
                }
                setShowEdit(false);
                fetchUserData();
              }} 
            />
          </Box>
        </Dialog>
      )}

      {/* Posts Section */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Posts
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {posts.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 3 }}>
            No posts yet
          </Typography>
        ) : (
          posts.map((post) => {
            try {
              return (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onUpdate={fetchUserData}
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

export default Profile;
