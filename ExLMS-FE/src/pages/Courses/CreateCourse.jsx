import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import courseService from '../../services/courseService'
import FileUpload from '../../components/Common/FileUpload'

const CreateCourse = () => {
  const { groupId } = useParams()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'DRAFT',
    thumbnailKey: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()

  const handleUploadSuccess = (fileKey) => {
    setFormData(prev => ({ ...prev, thumbnailKey: fileKey }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await courseService.createCourse(groupId, formData)
      navigate(`/groups/${groupId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Create New Course
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Add a new course to your study group to start teaching.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to Spring Boot"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what students will learn..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Course Thumbnail</Typography>
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                accept="image/*"
                label="Select Thumbnail"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Initial Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="DRAFT">Draft (Only you can see it)</MenuItem>
                <MenuItem value="PUBLISHED">Published (Available to all members)</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate(`/groups/${groupId}`)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default CreateCourse
