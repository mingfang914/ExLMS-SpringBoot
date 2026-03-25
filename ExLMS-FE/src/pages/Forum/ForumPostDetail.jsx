import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Divider,
  Button,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Reply as ReplyIcon,
  CheckCircle as AcceptedIcon,
  ArrowUpward as UpvoteIcon,
  ArrowDownward as DownvoteIcon,
  PushPin as PinIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import forumService from '../../services/forumService'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const ForumPostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget)
  const handleCloseMenu = () => setAnchorEl(null)

  const fetchPostData = async () => {
    try {
      const postData = await forumService.getPostById(id)
      setPost(postData)
      const commentData = await forumService.getCommentsByPostId(id)
      setComments(commentData)
    } catch (err) {
      setError('Không thể tải bài viết.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPostData()
  }, [id])

  const handleVote = async (postId, voteType) => {
    try {
      await forumService.votePost(postId, voteType)
      fetchPostData()
    } catch (err) {
      console.error('Failed to vote')
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      await forumService.addComment(id, {
        content: commentText,
        parentId: replyTo?.id
      })
      setCommentText('')
      setReplyTo(null)
      fetchPostData()
    } catch (err) {
      console.error('Failed to add comment')
    }
  }

  const CommentItem = ({ comment, depth = 0 }) => (
    <Box sx={{ ml: depth * 4, mt: 2 }}>
      <Paper elevation={0} sx={{ p: 2, borderLeft: '3px solid', borderColor: comment.accepted ? 'success.main' : 'divider', bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar 
            src={comment.authorAvatarKey ? `http://localhost:3000/api/files/download/${comment.authorAvatarKey}` : null}
            sx={{ width: 32, height: 32 }}
          >
            {comment.authorName?.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {comment.authorName}
                {comment.accepted && (
                  <Chip label="Đã chấp nhận" color="success" size="small" icon={<AcceptedIcon />} sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ my: 1 }}>{comment.content}</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton size="small" onClick={() => forumService.voteComment(comment.id, 'UPVOTE').then(fetchPostData)}>
                  <UpvoteIcon fontSize="inherit" />
                </IconButton>
                <Typography variant="caption">{comment.upvoteCount}</Typography>
                <IconButton size="small" onClick={() => forumService.voteComment(comment.id, 'DOWNVOTE').then(fetchPostData)}>
                  <DownvoteIcon fontSize="inherit" />
                </IconButton>
              </Box>
              {depth < 2 && (
                <Button size="small" startIcon={<ReplyIcon />} onClick={() => setReplyTo(comment)}>
                  Trả lời
                </Button>
              )}
              {((post.authorId === user?.id) || user?.role === 'ADMIN') && !comment.accepted && (
                <Button 
                  size="small" 
                  color="success"
                  startIcon={<AcceptedIcon />} 
                  onClick={() => forumService.acceptComment(comment.id).then(fetchPostData)}
                >
                  Chấp nhận
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
      {comment.replies && comment.replies.map(child => (
        <CommentItem key={child.id} comment={child} depth={depth + 1} />
      ))}
    </Box>
  )

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!post) return <Alert severity="info">Bài viết không tồn tại.</Alert>

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        {/* Post Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {post.pinned && <PinIcon color="primary" fontSize="small" />}
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  {post.title}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar 
                    src={post.authorAvatarKey ? `http://localhost:3000/api/files/download/${post.authorAvatarKey}` : null}
                    sx={{ width: 40, height: 40, border: '2px solid', borderColor: 'primary.light' }}
                  >
                    {post.authorName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1 }}>
                      {post.authorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {post.viewCount} lượt xem
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {post.tags.map(tag => (
                    <Chip 
                      key={tag.id} 
                      label={tag.name} 
                      size="small"
                      sx={{ 
                        height: 24,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: tag.color + '15', 
                        color: tag.color,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: tag.color + '30'
                      }} 
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {((post.authorId === user?.id) || user?.role === 'ADMIN') && (
                <>
                  <IconButton onClick={handleOpenMenu} size="small">
                    <MoreIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    PaperProps={{ sx: { borderRadius: 2, minWidth: 150, mt: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
                  >
                    <MenuItem onClick={() => { handleCloseMenu(); navigate(`/forum/edit/${post.id}`); }}>
                      <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Chỉnh sửa" primaryTypographyProps={{ variant: 'body2' }} />
                    </MenuItem>
                    <MenuItem 
                      onClick={async () => {
                        handleCloseMenu();
                        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                          try {
                            await forumService.deletePost(post.id)
                            navigate('/forum')
                          } catch (err) {
                            console.error('Failed to delete post')
                          }
                        }
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                      <ListItemText primary="Xóa bài viết" primaryTypographyProps={{ variant: 'body2' }} />
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 4, opacity: 0.6 }} />

        {/* Post Content with Side Voting */}
        <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 } }}>
          {/* Side Voting Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton 
                size="small" 
                onClick={() => handleVote(post.id, 'UPVOTE')}
                sx={{ bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}
              >
                <UpvoteIcon />
              </IconButton>
            </motion.div>
            
            <Typography variant="h6" sx={{ fontWeight: 800, my: 1, color: 'text.primary' }}>
              {post.upvoteCount}
            </Typography>
            
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton 
                size="small" 
                onClick={() => handleVote(post.id, 'DOWNVOTE')}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <DownvoteIcon />
              </IconButton>
            </motion.div>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Box 
              sx={{ mb: 6 }}
              className="ck-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

            {/* Comments Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                Bình luận
                <Chip label={comments.length} size="small" sx={{ fontWeight: 800 }} />
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                {replyTo && (
                  <Alert 
                    severity="info" 
                    sx={{ mb: 1, borderRadius: 2 }} 
                    onClose={() => setReplyTo(null)}
                    icon={<ReplyIcon fontSize="small" />}
                  >
                    Đang trả lời <strong>{replyTo.authorName}</strong>
                  </Alert>
                )}
                <form onSubmit={handleCommentSubmit}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Chia sẻ ý kiến của bạn..."
                    variant="outlined"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'grey.50'
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={!commentText.trim()}
                      sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
                    >
                      Gửi bình luận
                    </Button>
                  </Box>
                </form>
              </Box>

              <List sx={{ pt: 0 }}>
                {comments.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</Typography>
                  </Box>
                ) : (
                  comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))
                )}
              </List>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default ForumPostDetail
