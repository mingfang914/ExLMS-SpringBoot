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
  List,
  ListItem,
  ListItemAvatar,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  ChatBubbleOutline as CommentIcon,
  ThumbUpOutlined as LikeIcon,
  PushPin as PinIcon,
  PushPinOutlined as UnpinIcon
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import forumService from '../../services/forumService'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const stripHtml = (html) => {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const ForumList = () => {
  const [posts, setPosts] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = {
        search: searchTerm,
        tag: selectedTag?.slug
      }
      const data = await forumService.getPosts(params)
      setPosts(data)
    } catch (err) {
      setError('Không thể tải danh sách bài viết.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const data = await forumService.getTags()
      setTags(data)
    } catch (err) {
      console.error('Failed to load tags')
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPosts()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, selectedTag])

  const handleTagClick = (tag) => {
    if (selectedTag?.id === tag.id) {
      setSelectedTag(null)
    } else {
      setSelectedTag(tag)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Diễn đàn Cộng đồng
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/forum/create"
          sx={{ borderRadius: 2, px: 3 }}
        >
          Bài viết mới
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
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
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          ) : posts.length === 0 ? (
            <Paper sx={{ p: 10, textAlign: 'center', borderRadius: 2 }}>
              <Typography color="text.secondary">Chưa có bài viết nào phù hợp.</Typography>
            </Paper>
          ) : (
            <List sx={{ p: 0 }}>
              {posts.map((post) => (
                <Paper
                  key={post.id}
                  elevation={0}
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <ListItem
                    alignItems="flex-start"
                    component={Link}
                    to={`/forum/posts/${post.id}`}
                    sx={{ textDecoration: 'none', color: 'inherit', p: 3 }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={post.authorAvatarKey ? `http://localhost:3000/api/files/download/${post.authorAvatarKey}` : null}
                        sx={{ bgcolor: 'secondary.main' }}
                      >
                        {post.authorName?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {post.pinned && (
                          <Tooltip title="Được ghim">
                            <PinIcon color="primary" fontSize="small" />
                          </Tooltip>
                        )}
                        <Typography variant="h6" sx={{ fontWeight: '600', lineHeight: 1.3 }}>
                          {post.title}
                        </Typography>
                      </Box>

                      {/* Content Snippet */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2, 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.6
                        }}
                      >
                        {stripHtml(post.content)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {post.tags.map(tag => (
                          <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              bgcolor: (tag.color || '#6366F1') + '20',
                              color: tag.color || '#6366F1',
                              borderColor: (tag.color || '#6366F1') + '40'
                            }}
                            variant="outlined"
                          />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'text.secondary', fontSize: '0.85rem' }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Đăng bởi <strong>{post.authorName}</strong> • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LikeIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">{post.upvoteCount}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CommentIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">{post.viewCount} lượt xem</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Chủ đề phổ biến</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {tags.map(tag => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  onClick={() => handleTagClick(tag)}
                  color={selectedTag?.id === tag.id ? 'primary' : 'default'}
                  variant={selectedTag?.id === tag.id ? 'filled' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    '&:hover': { bgcolor: selectedTag?.id === tag.id ? 'primary.dark' : 'action.hover' }
                  }}
                />
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Quy tắc diễn đàn</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              • Tôn trọng và giúp đỡ lẫn nhau.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              • Không spam hoặc quảng cáo trái phép.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              • Sử dụng Tag chính xác để bài viết dễ tìm thấy hơn.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ForumList
