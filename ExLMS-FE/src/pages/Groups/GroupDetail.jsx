import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia
} from '@mui/material'
import {
  People as PeopleIcon,
  Info as InfoIcon,
  Book as CourseIcon,
  Assignment as AssignmentIcon,
  Forum as ForumIcon,
  VideoCall as MeetingIcon,
  Settings as SettingsIcon,
  Share as ShareIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import groupService from '../../services/groupService'
import courseService from '../../services/courseService'

const GroupDetail = () => {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [courses, setCourses] = useState([])
  const [meetings, setMeetings] = useState([]) // New state for meetings
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  // Mock meetings
  const mockMeetings = [
    { id: 'meet-1', title: 'Spring Boot Q&A', startAt: 'Today, 3:00 PM', roomName: 'CS2024-Spring-QA' },
    { id: 'meet-2', title: 'Assignment Review', startAt: 'Tomorrow, 10:00 AM', roomName: 'CS2024-Review' }
  ]

  useEffect(() => {
    const fetchGroupData = async () => {
      setLoading(true)
      try {
        const [groupData, coursesData] = await Promise.all([
          groupService.getGroupById(id),
          courseService.getCoursesByGroupId(id)
        ])
        setGroup(groupData)
        setCourses(coursesData)
        setMeetings(mockMeetings) // Use mock for now
      } catch (err) {
        setError('Failed to load group details.')
      } finally {
        setLoading(false)
      }
    }
    fetchGroupData()
  }, [id])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!group) return <Alert severity="warning">Group not found.</Alert>

  return (
    <Box>
      {/* Group Header */}
      <Paper sx={{ p: 0, mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            height: 200,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${group.coverUrl || 'https://via.placeholder.com/1200x300?text=Group+Cover'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            p: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
            <Avatar
              sx={{ width: 100, height: 100, border: '4px solid white', mr: 3, bgcolor: 'primary.main' }}
            >
              {group.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{group.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Chip label={group.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  <Typography variant="body2">{group.memberCount} members</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3 }}>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
            <Tab icon={<InfoIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<CourseIcon />} iconPosition="start" label="Courses" />
            <Tab icon={<AssignmentIcon />} iconPosition="start" label="Assignments" />
            <Tab icon={<MeetingIcon />} iconPosition="start" label="Meetings" />
            <Tab icon={<ForumIcon />} iconPosition="start" label="Feed" />
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Members" />
          </Tabs>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Share group">
              <IconButton><ShareIcon /></IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<SettingsIcon />}>Manage</Button>
          </Box>
        </Box>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>About this group</Typography>
                <Typography variant="body1" paragraph>
                  {group.description || 'No description provided.'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Owner</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Avatar sx={{ mr: 2 }}>{group.ownerName.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{group.ownerName}</Typography>
                    <Typography variant="body2" color="text.secondary">Group Founder</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" gutterBottom>Group Details</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary"><strong>Visibility:</strong> {group.visibility}</Typography>
                  <Typography variant="body2" color="text.secondary"><strong>Created:</strong> Recently</Typography>
                  <Typography variant="body2" color="text.secondary"><strong>Language:</strong> Vietnamese</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Courses in {group.name}</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={RouterLink}
                to={`/groups/${id}/courses/create`}
              >
                Create Course
              </Button>
            </Box>
            {courses.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">No courses available yet.</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {courses.map(course => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={course.thumbnailUrl || 'https://via.placeholder.com/300x150?text=Course'}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{course.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {course.description}
                        </Typography>
                        <Chip label={course.status} size="small" sx={{ mt: 2 }} />
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          component={RouterLink}
                          to={`/groups/${id}/courses/${course.id}`}
                        >
                          View Course
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Assignments</Typography>
              <Button
                variant="contained"
                component={RouterLink}
                to={`/groups/${id}/assignments`}
              >
                View All Assignments
              </Button>
            </Box>
            <Paper sx={{ p: 5, textAlign: 'center' }}>
              <Typography color="text.secondary">Click "View All Assignments" to manage tasks.</Typography>
            </Paper>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Online Meetings</Typography>
              <Button variant="contained" startIcon={<MeetingIcon />}>Schedule Meeting</Button>
            </Box>
            <Grid container spacing={3}>
              {meetings.map((meeting) => (
                <Grid item xs={12} md={6} key={meeting.id}>
                  <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{meeting.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{meeting.startAt}</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to={`/groups/${id}/meetings/${meeting.id}`}
                      state={{ roomName: meeting.roomName, title: meeting.title }}
                    >
                      Join Now
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Placeholder for other tabs */}
        {(activeTab === 4 || activeTab === 5) && (
          <Paper sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">This feature is coming soon.</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

export default GroupDetail
