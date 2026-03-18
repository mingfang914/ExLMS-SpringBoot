import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  CheckCircle as DoneIcon,
  HourglassEmpty as PendingIcon,
  Schedule as DueIcon
} from '@mui/icons-material'
import { Link, useParams } from 'react-router-dom'
import assignmentService from '../../services/assignmentService'

const AssignmentList = () => {
  const { groupId } = useParams()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock data
  const mockAssignments = [
    { id: 1, title: 'Project Proposal', dueDate: '2026-03-25T23:59:00', status: 'Graded' },
    { id: 2, title: 'API Implementation', dueDate: '2026-04-02T23:59:00', status: 'Submitted' },
    { id: 3, title: 'Final Report', dueDate: '2026-04-10T23:59:00', status: 'Pending' },
  ]

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true)
      try {
        // const data = await assignmentService.getAssignmentsByGroup(groupId)
        // setAssignments(data)
        setAssignments(mockAssignments)
      } catch (err) {
        setError('Failed to load assignments.')
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [groupId])

  const getStatusChip = (status) => {
    switch (status) {
      case 'Graded':
        return <Chip label="Graded" color="success" size="small" />
      case 'Submitted':
        return <Chip label="Submitted" color="primary" size="small" />
      default:
        return <Chip label="Pending" color="warning" size="small" />
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Assignments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to={`/groups/${groupId}/assignments/create`}
        >
          New Assignment
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {assignments.map((assignment, index) => (
              <React.Fragment key={assignment.id}>
                <ListItem
                  button
                  component={Link}
                  to={`/groups/${groupId}/assignments/${assignment.id}`}
                  sx={{ p: 3 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}><AssignmentIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={assignment.title}
                    primaryTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <DueIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Due: {new Date(assignment.dueDate).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                  {getStatusChip(assignment.status)}
                </ListItem>
                {index < assignments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  )
}

export default AssignmentList
