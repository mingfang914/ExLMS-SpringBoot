import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import forumService from '../../services/forumService'
import CKEditorWrapper from '../../components/Common/CKEditorWrapper'

const CreateForumPost = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagNames, setTagNames] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  useEffect(() => {
    if (isEdit) {
      const fetchPost = async () => {
        try {
          const post = await forumService.getPostById(id)
          setTitle(post.title)
          setContent(post.content)
          setTagNames(post.tags.map(tag => tag.name).join(', '))
        } catch (err) {
          setError('Không thể tải dữ liệu bài viết để chỉnh sửa.')
        }
      }
      fetchPost()
    }
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !content) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const postData = {
        title,
        content,
        tagNames
      }
      
      if (isEdit) {
        await forumService.updatePost(id, postData)
      } else {
        await forumService.createPost(postData)
      }
      
      navigate(isEdit ? `/forum/posts/${id}` : '/forum')
    } catch (err) {
      setError(err.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'tạo'} bài viết.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
      </Typography>
      
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tiêu đề"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="VD: Cách cấu hình Spring Security với JWT?"
          />

          <TextField
            fullWidth
            label="Tags (tối đa 3 tags, ngăn cách bằng dấu phẩy)"
            variant="outlined"
            value={tagNames}
            onChange={(e) => setTagNames(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="VD: java, spring-boot, security"
            helperText="Các tag sẽ giúp bài viết của bạn dễ được tìm thấy hơn."
          />

          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Nội dung bài viết</Typography>
          <CKEditorWrapper
            value={content}
            onChange={(data) => setContent(data)}
            placeholder="Mô tả chi tiết câu hỏi hoặc kiến thức của bạn..."
            minHeight="400px"
          />

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/forum')}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={loading}
              sx={{ px: 4 }}
            >
              {isEdit ? 'Lưu thay đổi' : 'Đăng bài'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}

export default CreateForumPost
