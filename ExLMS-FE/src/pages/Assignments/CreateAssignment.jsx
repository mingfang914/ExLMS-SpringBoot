import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import assignmentService from '../../services/assignmentService'

const CreateAssignment = () => {
  const { groupId } = useParams()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Format date for backend if needed
      const payload = {
        ...formData,
        dueAt: new Date(formData.dueDate).toISOString()
      }
      delete payload.dueDate // Remove frontend intermediate field
      await assignmentService.createAssignment(groupId, payload)
      navigate(`/groups/${groupId}/assignments`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Create New Assignment
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Assignment Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Instructions / Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="datetime-local"
                label="Due Date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Maximum Score"
                name="maxScore"
                value={formData.maxScore}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate(`/groups/${groupId}/assignments`)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default CreateAssignment
