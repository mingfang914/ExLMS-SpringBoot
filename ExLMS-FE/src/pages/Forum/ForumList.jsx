import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  ChatBubbleOutline as CommentIcon,
  ThumbUpOutlined as LikeIcon,
  Label as TagIcon
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import forumService from '../../services/forumService'

const ForumList = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock forum posts
  const mockPosts = [
    {
      id: 1,
      title: 'How to setup Spring Security with JWT?',
      author: 'John Doe',
      authorAvatar: '',
      tags: ['Spring Boot', 'Security', 'Java'],
      likes: 15,
      comments: 8,
      createdAt: '2 hours ago'
    },
    {
      id: 2,
      title: 'React Query vs SWR: Which one to choose?',
      author: 'Jane Smith',
      authorAvatar: '',
      tags: ['React', 'Frontend'],
      likes: 24,
      comments: 12,
      createdAt: '5 hours ago'
    },
    {
      id: 3,
      title: 'My experience with MinIO in a production environment',
      author: 'Bob Wilson',
      authorAvatar: '',
      tags: ['Storage', 'DevOps'],
      likes: 10,
      comments: 3,
      createdAt: '1 day ago'
    }
  ]

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        // const data = await forumService.getPosts()
        // setPosts(data)
        setPosts(mockPosts)
      } catch (err) {
        setError('Failed to load forum posts.')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Community Forum</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/forum/create"
        >
          New Post
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Search discussions by title or tag..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <List sx={{ p: 0 }}>
              {filteredPosts.map((post, index) => (
                <Paper key={post.id} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                  <ListItem
                    alignItems="flex-start"
                    component={Link}
                    to={`/forum/posts/${post.id}`}
                    sx={{ textDecoration: 'none', color: 'inherit', p: 3, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <ListItemAvatar>
                      <Avatar>{post.author.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {post.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        {post.tags.map(tag => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'text.secondary' }}>
                        <Typography variant="caption">
                          By <strong>{post.author}</strong> • {post.createdAt}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LikeIcon fontSize="small" />
                          <Typography variant="caption">{post.likes}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CommentIcon fontSize="small" />
                          <Typography variant="caption">{post.comments}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                </Paper>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Popular Tags</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {['Spring Boot', 'React', 'Java', 'Python', 'DevOps', 'Frontend', 'Database'].map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => setSearchTerm(tag)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Forum Rules</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                1. Be respectful to others.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. No spam or self-promotion.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Use appropriate tags for your posts.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default ForumList
