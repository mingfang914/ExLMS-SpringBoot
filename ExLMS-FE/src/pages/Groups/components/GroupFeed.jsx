import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Alert,
  Stack
} from '@mui/material'
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  PushPin as PinIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  Book as CourseIcon,
  Assignment as AssignmentIcon,
  VideoCall as MeetingIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import CKEditorWrapper from '../../../components/Common/CKEditorWrapper'
import groupFeedService from '../../../services/groupFeedService'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

const GroupFeed = ({ groupId, currentUserRole, groupCourses = [], groupAssignments = [], groupMeetings = [] }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // New Post State
  const [isCreating, setIsCreating] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [linkedEntity, setLinkedEntity] = useState(null) // { id, type, title }
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)

  // Auth Context from Redux
  const { user: currentUser } = useSelector((state) => state.auth)

  const fetchPosts = async (reset = false) => {
    try {
      if (reset) setLoading(true)
      const currentPage = reset ? 0 : page
      const data = await groupFeedService.getGroupFeed(groupId, filterType, currentPage)
      if (reset) {
        setPosts(data.content)
      } else {
        setPosts(prev => [...prev, ...data.content])
      }
      setHasMore(!data.last)
      setPage(currentPage + 1)
    } catch (err) {
      console.error('Failed to fetch feed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(true)
  }, [groupId, filterType])

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    try {
      const postData = {
        content: newPostContent,
        linkedEntityId: linkedEntity?.id,
        linkedEntityType: linkedEntity?.type,
        pinned: false
      }
      const newPost = await groupFeedService.createPost(groupId, postData)
      setPosts([newPost, ...posts])
      setNewPostContent('')
      setLinkedEntity(null)
      setIsCreating(false)
    } catch (err) {
      alert('Lỗi khi đăng bài!')
    }
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await groupFeedService.deletePost(groupId, postId)
        setPosts(posts.filter(p => p.id !== postId))
      } catch (err) {
        alert('Lỗi khi xóa bài viết!')
      }
    }
  }

  const handleTogglePin = async (postId) => {
    try {
      await groupFeedService.togglePinPost(groupId, postId)
      setPosts(posts.map(p => p.id === postId ? { ...p, pinned: !p.pinned } : p))
    } catch (err) {
      alert('Lỗi khi ghim bài viết!')
    }
  }

  const handleToggleReaction = async (postId) => {
    try {
      await groupFeedService.toggleReaction(groupId, postId)
      // Note: Backend handles toggle, but we might want to refresh count accurately
      // For simplicity, we'll just refetch or manually adjust (service returns a string usually)
      fetchPosts(true) // Slightly heavy but accurate
    } catch (err) {
      console.error(err)
    }
  }

  const getEntityIcon = (type) => {
    switch (type) {
      case 'COURSE': return <CourseIcon fontSize="small" />
      case 'ASSIGNMENT': return <AssignmentIcon fontSize="small" />
      case 'MEETING': return <MeetingIcon fontSize="small" />
      default: return <LinkIcon fontSize="small" />
    }
  }

  const getAvatarUrl = (key) => key ? `http://localhost:3000/api/files/download/${key}` : null

  const formatDate = (dateInput) => {
    if (!dateInput) return 'Vừa xong'
    try {
      // Handle array format if backend returns [y, m, d, h, m, s]
      if (Array.isArray(dateInput)) {
        const [y, mon, d, h, min, s] = dateInput
        return formatDistanceToNow(new Date(y, mon - 1, d, h, min, s), { addSuffix: true, locale: vi })
      }
      return formatDistanceToNow(new Date(dateInput), { addSuffix: true, locale: vi })
    } catch (err) {
      return 'Vừa xong'
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Category Filters */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
        <Chip 
          label="Tất cả" 
          onClick={() => setFilterType('')} 
          color={filterType === '' ? 'primary' : 'default'} 
          variant={filterType === '' ? 'filled' : 'outlined'}
        />
        <Chip 
          label="Khóa học" 
          onClick={() => setFilterType('COURSE')} 
          color={filterType === 'COURSE' ? 'primary' : 'default'}
          variant={filterType === 'COURSE' ? 'filled' : 'outlined'}
          icon={<CourseIcon />}
        />
        <Chip 
          label="Bài tập" 
          onClick={() => setFilterType('ASSIGNMENT')} 
          color={filterType === 'ASSIGNMENT' ? 'primary' : 'default'}
          variant={filterType === 'ASSIGNMENT' ? 'filled' : 'outlined'}
          icon={<AssignmentIcon />}
        />
        <Chip 
          label="Buổi họp" 
          onClick={() => setFilterType('MEETING')} 
          color={filterType === 'MEETING' ? 'primary' : 'default'}
          variant={filterType === 'MEETING' ? 'filled' : 'outlined'}
          icon={<MeetingIcon />}
        />
        <Chip 
          label="Ghim" 
          onClick={() => setFilterType('NOTICE')} 
          color={filterType === 'NOTICE' ? 'primary' : 'default'}
          variant={filterType === 'NOTICE' ? 'filled' : 'outlined'}
          icon={<PinIcon />}
        />
      </Stack>

      {/* Post Creator */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        {!isCreating ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={getAvatarUrl(currentUser.avatarKey)} />
            <Box 
              onClick={() => setIsCreating(true)}
              sx={{ 
                flexGrow: 1, 
                bgcolor: 'grey.100', 
                borderRadius: 5, 
                px: 3, 
                py: 1.5, 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'grey.200' }
              }}
            >
              <Typography color="text.secondary">Bạn đang nghĩ gì...</Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Tạo bài viết mới</Typography>
            <Box sx={{ mb: 2 }}>
              <CKEditorWrapper
                value={newPostContent}
                onChange={(data) => setNewPostContent(data)}
                placeholder="Chia sẻ kiến thức hoặc đặt câu hỏi..."
                minHeight="150px"
              />
            </Box>
            
            {linkedEntity && (
              <Chip
                icon={getEntityIcon(linkedEntity.type)}
                label={`Đính kèm: ${linkedEntity.title}`}
                onDelete={() => setLinkedEntity(null)}
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button 
                startIcon={<LinkIcon />} 
                onClick={() => setLinkDialogOpen(true)}
                size="small"
              >
                Gắn liên kết
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => setIsCreating(false)}>Hủy</Button>
                <Button variant="contained" onClick={handleCreatePost} disabled={!newPostContent.trim()}>Đăng bài</Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Feed List */}
      <AnimatePresence>
        {loading && page === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
        ) : posts.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
            <Typography color="text.secondary">Chưa có bài viết nào trong mục này.</Typography>
          </Paper>
        ) : (
          posts.map((post) => (
            <PostItem 
              key={post.id} 
              post={post} 
              currentUser={currentUser}
              currentUserRole={currentUserRole}
              onDelete={handleDeletePost}
              onTogglePin={handleTogglePin}
              onToggleReaction={handleToggleReaction}
              groupId={groupId}
              formatDate={formatDate}
              setPosts={setPosts}
              posts={posts}
            />
          ))
        )}
      </AnimatePresence>

      {hasMore && !loading && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => fetchPosts()}>Tải thêm</Button>
        </Box>
      )}

      {/* Link Selector Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Chọn nội dung để đính kèm</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom color="primary">Khóa học</Typography>
          <List size="small">
            {groupCourses.length > 0 ? groupCourses.map(c => (
              <ListItem button key={c.id} onClick={() => { setLinkedEntity({ id: c.id, type: 'COURSE', title: c.title }); setLinkDialogOpen(false); }}>
                <ListItemIcon><CourseIcon color="primary" /></ListItemIcon>
                <ListItemText primary={c.title} />
              </ListItem>
            )) : <Typography variant="caption" sx={{ pl: 2 }}>Trống</Typography>}
          </List>
          
          <Typography variant="subtitle2" gutterBottom color="success.main" sx={{ mt: 2 }}>Bài tập</Typography>
          <List size="small">
            {groupAssignments.length > 0 ? groupAssignments.map(a => (
              <ListItem button key={a.id} onClick={() => { setLinkedEntity({ id: a.id, type: 'ASSIGNMENT', title: a.title }); setLinkDialogOpen(false); }}>
                <ListItemIcon><AssignmentIcon color="success" /></ListItemIcon>
                <ListItemText primary={a.title} />
              </ListItem>
            )) : <Typography variant="caption" sx={{ pl: 2 }}>Trống</Typography>}
          </List>

          <Typography variant="subtitle2" gutterBottom color="warning.main" sx={{ mt: 2 }}>Buổi họp</Typography>
          <List size="small">
            {groupMeetings.length > 0 ? groupMeetings.map(m => (
              <ListItem button key={m.id} onClick={() => { setLinkedEntity({ id: m.id, type: 'MEETING', title: m.title }); setLinkDialogOpen(false); }}>
                <ListItemIcon><MeetingIcon color="warning" /></ListItemIcon>
                <ListItemText primary={m.title} />
              </ListItem>
            )) : <Typography variant="caption" sx={{ pl: 2 }}>Trống</Typography>}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

const PostItem = ({ post, currentUser, currentUserRole, onDelete, onTogglePin, onToggleReaction, groupId, formatDate, setPosts, posts }) => {
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  const handleFetchComments = async () => {
    if (!showComments) {
      setLoadingComments(true)
      try {
        const data = await groupFeedService.getPostComments(groupId, post.id)
        setComments(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingComments(false)
      }
    }
    setShowComments(!showComments)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      const added = await groupFeedService.addComment(groupId, post.id, { content: newComment })
      setComments([...comments, added])
      setNewComment('')
      post.commentCount += 1 // Optimistic update
    } catch (err) {
      alert('Lỗi khi gửi bình luận!')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return
    try {
      await groupFeedService.deleteComment(groupId, commentId)
      setComments(comments.filter(c => c.id !== commentId))
      post.commentCount -= 1
    } catch (err) {
      alert('Lỗi xác thực hoặc không có quyền xóa!')
    }
  }

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) return
    try {
      const updated = await groupFeedService.updateComment(groupId, commentId, { content: editingCommentText })
      setComments(comments.map(c => c.id === commentId ? updated : c))
      setEditingCommentId(null)
    } catch (err) {
      alert('Lỗi khi cập nhật bình luận!')
    }
  }

  const handleUpdatePost = async () => {
    if (!editedContent.trim()) return
    try {
      const updated = await groupFeedService.updatePost(groupId, post.id, { 
        content: editedContent,
        linkedEntityId: post.linkedEntityId,
        linkedEntityType: post.linkedEntityType,
        pinned: post.pinned
      })
      setPosts(posts.map(p => p.id === post.id ? updated : p))
      setIsEditing(false)
    } catch (err) {
      alert('Lỗi khi cập nhật bài viết!')
    }
  }

  const getAvatarUrl = (key) => key ? `http://localhost:3000/api/files/download/${key}` : null
  
  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'OWNER': return 'error'
      case 'EDITOR': return 'warning'
      default: return 'default'
    }
  }

  const getEntityLabel = (type) => {
    switch (type) {
      case 'COURSE': return 'Khóa học'
      case 'ASSIGNMENT': return 'Bài tập'
      case 'MEETING': return 'Buổi họp'
      default: return 'Liên kết'
    }
  }

  const getEntityIcon = (type) => {
    switch (type) {
      case 'COURSE': return <CourseIcon fontSize="small" />
      case 'ASSIGNMENT': return <AssignmentIcon fontSize="small" />
      case 'MEETING': return <MeetingIcon fontSize="small" />
      default: return <LinkIcon fontSize="small" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, position: 'relative' }}>
        {post.pinned && (
          <Chip
            icon={<PinIcon sx={{ fontSize: '14px !important' }} />}
            label="Đã ghim"
            size="small"
            color="primary"
            sx={{ position: 'absolute', top: 12, right: 60, height: 20, fontSize: 10 }}
          />
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar src={getAvatarUrl(post.authorAvatarKey)} sx={{ border: '2px solid', borderColor: getRoleColor(post.authorGroupRole) + '.main' }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">{post.authorName}</Typography>
                <Chip label={post.authorGroupRole} size="small" variant="outlined" color={getRoleColor(post.authorGroupRole)} sx={{ height: 18, fontSize: 10 }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.createdAt)}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            {(currentUser.id === post.authorId || currentUserRole === 'OWNER' || currentUserRole === 'EDITOR') && (
              <>
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}><MoreVertIcon /></IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  { (currentUserRole === 'OWNER' || currentUserRole === 'EDITOR') && (
                    <MenuItem onClick={() => { onTogglePin(post.id); setAnchorEl(null); }}>
                      <PinIcon fontSize="small" sx={{ mr: 1 }} /> {post.pinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                    </MenuItem>
                  )}
                  { currentUser.id === post.authorId && (
                    <MenuItem onClick={() => { setIsEditing(true); setAnchorEl(null); }}>
                      <EditIcon fontSize="small" sx={{ mr: 1 }} /> Chỉnh sửa
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => { onDelete(post.id); setAnchorEl(null); }} sx={{ color: 'error.main' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Xóa bài viết
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {isEditing ? (
          <Box sx={{ mb: 2 }}>
            <CKEditorWrapper
              value={editedContent}
              onChange={(data) => setEditedContent(data)}
              placeholder="Chỉnh sửa nội dung..."
              minHeight="150px"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
              <Button size="small" onClick={() => setIsEditing(false)}>Hủy</Button>
              <Button size="small" variant="contained" onClick={handleUpdatePost}>Cập nhật</Button>
            </Box>
          </Box>
        ) : (
          <Box className="ck-content" sx={{ mb: 2 }}>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </Box>
        )}

        {post.linkedEntityId && (
          <Box 
            sx={{ 
              p: 1.5, 
              mb: 2, 
              borderRadius: 2, 
              bgcolor: 'action.hover', 
              border: '1px solid', 
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.selected' }
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36 }}>{getEntityIcon(post.linkedEntityType)}</Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="primary" fontWeight="bold">{getEntityLabel(post.linkedEntityType)}</Typography>
              <Typography variant="body2" fontWeight="medium">Thực thể liên kết nội bộ (Nhấp để xem chi tiết)</Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              startIcon={post.reactionCount > 0 ? <ThumbUpIcon color="primary" /> : <ThumbUpOutlinedIcon />}
              onClick={() => onToggleReaction(post.id)}
            >
              {post.reactionCount || 'Thích'}
            </Button>
            <Button size="small" startIcon={<CommentIcon />} onClick={handleFetchComments}>
              {post.commentCount || 'Bình luận'}
            </Button>
          </Box>
        </Box>

        <Collapse in={showComments}>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {loadingComments ? <CircularProgress size={20} /> : (
              <List>
                {comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                    <Avatar 
                      src={getAvatarUrl(comment.authorAvatarKey)} 
                      sx={{ width: 32, height: 32, mr: 2, border: '1px solid', borderColor: getRoleColor(comment.authorGroupRole) + '.main' }} 
                    />
                    <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 2, flexGrow: 1, position: 'relative' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{comment.authorName}</Typography>
                        <Chip label={comment.authorGroupRole} size="small" sx={{ height: 16, fontSize: 8 }} color={getRoleColor(comment.authorGroupRole)} />
                      </Box>
                      
                      {editingCommentId === comment.id ? (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            sx={{ bgcolor: 'white' }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button size="tiny" sx={{ fontSize: 10 }} onClick={() => setEditingCommentId(null)}>Hủy</Button>
                            <Button size="tiny" sx={{ fontSize: 10 }} variant="contained" onClick={() => handleUpdateComment(comment.id)}>Sửa</Button>
                          </Box>
                        </Box>
                      ) : (
                        <>
                          <Typography variant="body2">{comment.content}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </>
                      )}
                      
                      {(currentUser.id === comment.authorId || currentUserRole === 'OWNER' || currentUserRole === 'EDITOR') && (
                        <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex' }}>
                          {currentUser.id === comment.authorId && editingCommentId !== comment.id && (
                            <IconButton 
                              size="small" 
                              onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content); }}
                            >
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteComment(comment.id)}
                            sx={{ color: 'error.light' }}
                          >
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
            
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Avatar src={getAvatarUrl(currentUser.avatarKey)} sx={{ width: 32, height: 32 }} />
              <TextField
                fullWidth
                size="small"
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={handleAddComment} disabled={!newComment.trim()}>
                      <SendIcon fontSize="small" color="primary" />
                    </IconButton>
                  )
                }}
              />
            </Box>
          </Box>
        </Collapse>
      </Paper>
    </motion.div>
  )
}

export default GroupFeed
