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
import { useNavigate } from 'react-router-dom'
import groupService from '../../services/groupService'
import FileUpload from '../../components/Common/FileUpload'

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'PUBLIC',
    category: '',
    coverKey: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()

  const handleUploadSuccess = (fileKey) => {
    setFormData(prev => ({ ...prev, coverKey: fileKey }))
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
      await groupService.createGroup(formData)
      navigate('/groups')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Create New Study Group
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Groups are the core of ExLMS. Create a group to start sharing courses and organizing meetings.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Group Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Advanced Java Programming"
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
                placeholder="Describe what this group is about..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Group Cover Image</Typography>
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                accept="image/*"
                label="Select Cover Image"
              />
              {formData.coverKey && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  Image uploaded successfully!
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
              >
                <MenuItem value="PUBLIC">Public (Anyone can find and request to join)</MenuItem>
                <MenuItem value="PRIVATE">Private (Invite only)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category / Subject"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/groups')}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default CreateGroup
