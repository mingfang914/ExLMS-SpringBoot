import React, { useState, useEffect } from 'react'
import { 
  Box, Typography, Paper, Button, Container, Grid, 
  Divider, Chip, Avatar, CircularProgress, Alert 
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  VideoCall as MeetIcon, 
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import meetingService from '../../services/meetingService'

const MeetingDetail = () => {
  const { groupId, id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [meeting, setMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const data = await meetingService.getMeeting(id)
        setMeeting(data)
      } catch (err) {
        setError('Không thể tải thông tin buổi họp')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMeeting()
  }, [id])

  const handleJoin = async () => {
    try {
      if (meeting.status === 'SCHEDULED' && isInstructor) {
        // Validation: Allow starting 15 mins before
        const now = new Date()
        const startAt = new Date(meeting.startAt)
        const diffMinutes = (startAt - now) / (1000 * 60)
        
        if (diffMinutes > 15) {
          alert(`Chưa đến giờ bắt đầu. Vui lòng quay lại sau (Ít nhất là 15 phút trước giờ bắt đầu)`)
          return
        }

        await meetingService.startMeeting(id)
      }
      navigate(`/groups/${groupId}/meetings/${id}/room`, { 
        state: { 
          roomName: meeting.joinUrl.split('/').pop(),
          title: meeting.title
        } 
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể bắt đầu buổi họp')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!meeting) return null

  const isInstructor = user.role === 'ADMIN' || user.role === 'INSTRUCTOR' || 
                       meeting.currentUserRole === 'OWNER' || meeting.currentUserRole === 'EDITOR'
  const isLive = meeting.status === 'LIVE'
  const isPast = meeting.status === 'ENDED'

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button startIcon={<BackIcon />} onClick={() => navigate(`/groups/${groupId}?tab=meetings`)} sx={{ mb: 2 }}>
        Quay lại nhóm
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <Chip 
                label={meeting.status === 'LIVE' ? 'Đang diễn ra' : meeting.status === 'ENDED' ? 'Đã kết thúc' : 'Đã lên lịch'} 
                color={meeting.status === 'LIVE' ? 'error' : 'default'}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
              <Typography variant="caption" color="text.secondary">
                ID: {meeting.id}
              </Typography>
            </Box>
            
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {meeting.title}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {meeting.description || 'Không có mô tả cho buổi họp này.'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon color="action" />
                <Typography variant="body1">
                  {format(new Date(meeting.startAt), 'EEEE, dd MMMM yyyy', { locale: vi })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TimeIcon color="action" />
                <Typography variant="body1">
                  {format(new Date(meeting.startAt), 'HH:mm')} ({meeting.durationMinutes} phút)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon color="action" />
                <Typography variant="body1">
                  Hình thức: {meeting.meetingType === 'VIDEO_CONFERENCE' ? 'Video Meeting' : meeting.meetingType}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.50', borderRadius: 2, p: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light', mb: 2 }}>
              <MeetIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<MeetIcon />}
              onClick={handleJoin}
              disabled={isPast || (!isLive && !isInstructor)}
              sx={{ 
                py: 1.5, 
                borderRadius: 2,
                boxShadow: 3,
                bgcolor: isLive ? 'error.main' : 'primary.main',
                '&:hover': { bgcolor: isLive ? 'error.dark' : 'primary.dark', boxShadow: 6 }
              }}
            >
              {isInstructor ? (isLive ? 'Tham gia lại (Host)' : 'Bắt đầu ngay (Host)') : (isLive ? 'Tham gia ngay' : 'Chưa đến giờ')}
            </Button>
            
            {!isLive && !isPast && !isInstructor && (
              <Typography variant="caption" sx={{ mt: 2, textAlign: 'center' }}>
                Vui lòng đợi cho đến khi Chủ nhóm hoặc Biên tập viên bắt đầu buổi họp.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default MeetingDetail
