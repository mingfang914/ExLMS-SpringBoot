import React from 'react'
import { Box, Typography, Paper, Button, Container } from '@mui/material'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import JitsiMeeting from '../../components/Meetings/JitsiMeeting'
import { ArrowBack as BackIcon } from '@mui/icons-material'

const MeetingRoom = () => {
  const { groupId, id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)

  // In a real app, we'd fetch the meeting details from the backend
  // For now, we'll use the roomName passed via location state or generate one
  const roomName = location.state?.roomName || `exlms-meeting-${id}`
  const meetingTitle = location.state?.title || 'Online Meeting'

  const handleMeetingEnd = () => {
    navigate(`/groups/${groupId}`)
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleMeetingEnd}
          sx={{ mr: 2 }}
        >
          Back to Group
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {meetingTitle}
        </Typography>
      </Box>

      <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
        <JitsiMeeting
          roomName={roomName}
          displayName={user?.fullName || user?.email}
          email={user?.email}
          onMeetingEnd={handleMeetingEnd}
        />
      </Paper>
    </Container>
  )
}

export default MeetingRoom
