import React, { useState, useEffect } from 'react';
import {
  Card,
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import { FavoriteBorder, Favorite, ChatBubbleOutline, Share, MoreVert } from '@mui/icons-material';
import { likePost, unlikePost, addComment, deletePost } from '../services/api';
import { useNavigate } from 'react-router-dom';

function PostCard({ post, onUpdate }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // ALL HOOKS MUST BE BEFORE ANY RETURNS
  useEffect(() => {
    if (post?.likes && Array.isArray(post.likes)) {
      setLikes(post.likes.length);

      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          setLiked(post.likes.includes(userData.id));
        } catch (err) {
          console.error('Error parsing user:', err);
        }
      }
    }

    if (post?.comments && Array.isArray(post.comments)) {
      setComments(post.comments);
    }
  }, [post]);

  // NOW do validation checks
  if (!post || !post._id) {
    console.error('Invalid post data:', post);
    return null;
  }

  const postUser = post.user;
  if (!postUser || !postUser._id) {
    console.error('Post has no user data:', post);
    return null;
  }

  const handleLike = async () => {
    try {
      if (liked) {
        await unlikePost(post._id);
        setLikes(likes - 1);
        setLiked(false);
      } else {
        await likePost(post._id);
        setLikes(likes + 1);
        setLiked(true);
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(post._id, { text: newComment });
      const user = JSON.parse(localStorage.getItem('user'));
      setComments([...comments, { text: newComment, user: { name: user?.name || 'You' } }]);
      setNewComment('');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Card sx={{ borderRadius: '12px', overflow: 'hidden', mb: 2 }}>
      {/* Post Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #e1e8ed' 
      }}>
        <Box 
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} 
          onClick={() => navigate(`/profile/${postUser._id}`)}
        >
          <Avatar src={postUser.profilePic} sx={{ width: 40, height: 40 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {postUser.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              @{postUser.username}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { handleDelete(); handleMenuClose(); }}>
            Delete
          </MenuItem>
        </Menu>
      </Box>

      {/* Post Content */}
      <Box sx={{ p: 2 }}>
        {post.caption && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            {post.caption}
          </Typography>
        )}
        {post.image && (
          <Box
            component="img"
            src={post.image}
            sx={{ 
              width: '100%', 
              borderRadius: '8px', 
              maxHeight: '400px', 
              objectFit: 'cover' 
            }}
            onError={(e) => {
              console.error('Image failed to load:', post.image);
              e.target.style.display = 'none';
            }}
          />
        )}
      </Box>

      {/* Post Actions */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-around', 
        borderTop: '1px solid #e1e8ed', 
        borderBottom: '1px solid #e1e8ed' 
      }}>
        <Box 
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} 
          onClick={handleLike}
        >
          {liked ? <Favorite sx={{ color: 'red' }} /> : <FavoriteBorder />}
          <Typography variant="caption">{likes}</Typography>
        </Box>
        <Box 
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} 
          onClick={() => setShowComments(!showComments)}
        >
          <ChatBubbleOutline />
          <Typography variant="caption">{comments.length}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
          <Share />
        </Box>
      </Box>

      {/* Comments Section */}
      {showComments && (
        <Box sx={{ p: 2, background: '#f9f9f9' }}>
          <Box sx={{ mb: 2, maxHeight: '200px', overflowY: 'auto' }}>
            {comments.map((comment, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  {comment.user?.name || 'User'}:{' '}
                </Typography>
                <Typography variant="caption">{comment.text}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button 
              size="small" 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Post
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
}

export default PostCard;