import React, { useState, useEffect, useCallback } from 'react'
import { 
  Box, Typography, Paper, Button, Container, Grid, 
  Tabs, Tab, List, ListItem, ListItemText, ListItemAvatar,
  Avatar, TextField, IconButton, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress
} from '@mui/material'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import JitsiMeeting from '../../components/Meetings/JitsiMeeting'
import { 
  ArrowBack as BackIcon, 
  Send as SendIcon,
  Poll as PollIcon,
  QuestionAnswer as QAIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  FiberManualRecord as LiveIcon
} from '@mui/icons-material'
import meetingService from '../../services/meetingService'

const MeetingRoom = () => {
  const { groupId, id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  
  const [tabValue, setTabValue] = useState(0)
  const [questions, setQuestions] = useState([])
  const [polls, setPolls] = useState([])
  const [attendance, setAttendance] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [answeringId, setAnsweringId] = useState(null)
  
  const roomName = location.state?.roomName || `exlms-meeting-${id}`
  const meetingTitle = location.state?.title || 'Online Meeting'
  const isInstructor = user.role === 'OWNER' || user.role === 'EDITOR'

  const fetchData = useCallback(async () => {
    try {
      const qs = await meetingService.getQuestions(id)
      setQuestions(qs)
      const ps = await meetingService.getPolls(id)
      setPolls(ps)
      if (isInstructor) {
        const att = await meetingService.getAttendanceReport(id)
        setAttendance(att)
      }
    } catch (err) {
      console.error('Error fetching room data', err)
    }
  }, [id, isInstructor])

  useEffect(() => {
    meetingService.recordAttendance(id, true)
    fetchData()
    const interval = setInterval(fetchData, 10000) // Poll every 10s
    return () => {
      clearInterval(interval)
      meetingService.recordAttendance(id, false)
    }
  }, [id, fetchData])

  const handleMeetingEnd = () => {
    navigate(`/groups/${groupId}/meetings/${id}`)
  }

  const handleSendQuestion = async () => {
    if (!newQuestion.trim()) return
    await meetingService.addQuestion(id, { content: newQuestion, isPrivate: false })
    setNewQuestion('')
    fetchData()
  }

  const handleAnswer = async () => {
    if (!answerText.trim()) return
    await meetingService.answerQuestion(answeringId, answerText)
    setAnsweringId(null)
    setAnswerText('')
    fetchData()
  }

  const handleVote = async (pollId, optionId) => {
    try {
      await meetingService.voteInPoll(pollId, optionId)
      fetchData()
    } catch (err) {
      alert('Bạn đã bình chọn rồi!')
    }
  }

  return (
    <Container maxWidth={false} sx={{ mt: 2, height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button startIcon={<BackIcon />} onClick={handleMeetingEnd} sx={{ mr: 2 }}>
            Rời phòng
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {meetingTitle}
          </Typography>
          <Chip icon={<LiveIcon sx={{ color: 'error.main !important', fontSize: 'small' }} />} label="LIVE" size="small" variant="outlined" sx={{ ml: 2, fontWeight: 'bold', color: 'error.main' }} />
        </Box>
        {isInstructor && (
            <Button variant="contained" color="error" onClick={async () => {
                await meetingService.endMeeting(id)
                handleMeetingEnd()
            }}>Kết thúc buổi họp</Button>
        )}
      </Box>

      <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0 }}>
        <Grid item xs={12} md={8.5} lg={9} sx={{ height: '100%' }}>
          <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', height: '100%', bgcolor: 'black' }}>
            <JitsiMeeting
              roomName={roomName}
              displayName={user?.fullName || user?.email}
              email={user?.email}
              onMeetingEnd={handleMeetingEnd}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={3.5} lg={3} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth">
              <Tab icon={<PeopleIcon />} label="Members" />
              <Tab icon={<QAIcon />} label="Q&A" />
              <Tab icon={<PollIcon />} label="Polls" />
            </Tabs>
            
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
              {tabValue === 0 && (
                <List>
                  {isInstructor ? (
                    attendance.map(a => (
                      <ListItem key={a.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: a.leftAt ? 'grey.400' : 'success.main' }}>{a.userName[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={a.userName} 
                          secondary={a.leftAt ? `Đã rời (${Math.round(a.durationSec/60)}p)` : 'Đang tham gia'} 
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                      Chỉ giảng viên có thể xem danh sách điểm danh chi tiết.
                    </Typography>
                  )}
                </List>
              )}

              {tabValue === 1 && (
                <Box>
                  <List sx={{ mb: 8 }}>
                    {questions.map(q => (
                      <Paper key={q.id} variant="outlined" sx={{ mb: 1, p: 1.5, borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{q.userName}</Typography>
                        <Typography variant="body2">{q.content}</Typography>
                        {q.answered ? (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'primary.50', borderRadius: 1, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 'bold' }}>Trả lời bởi {q.answeredByName}:</Typography>
                            <Typography variant="body2">{q.answer}</Typography>
                          </Box>
                        ) : (
                          isInstructor && (
                            <Button size="small" onClick={() => { setAnsweringId(q.id); setAnsweringId(q.id); }} sx={{ mt: 1 }}>Trả lời</Button>
                          )
                        )}
                      </Paper>
                    ))}
                  </List>
                  <Box sx={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', gap: 1, bgcolor: 'background.paper', p: 1 }}>
                    <TextField 
                      fullWidth size="small" placeholder="Đặt câu hỏi..." 
                      value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
                    />
                    <IconButton color="primary" onClick={handleSendQuestion}><SendIcon /></IconButton>
                  </Box>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  {polls.map(p => (
                    <Paper key={p.id} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>{p.question}</Typography>
                      {p.options.map(o => (
                        <Button 
                          key={o.id} 
                          fullWidth 
                          variant={p.userVotedOptionId === o.id ? "contained" : "outlined"}
                          onClick={() => handleVote(p.id, o.id)}
                          sx={{ mb: 1, justifyContent: 'space-between' }}
                        >
                          {o.label}
                          <Typography variant="caption">{o.voteCount} votes</Typography>
                        </Button>
                      ))}
                    </Paper>
                  ))}
                  {isInstructor && (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Tạo poll mới: (Sắp ra mắt)</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={!!answeringId} onClose={() => setAnsweringId(null)}>
        <DialogTitle>Trả lời câu hỏi</DialogTitle>
        <DialogContent>
          <TextField 
            autoFocus fullWidth multiline rows={3} label="Câu trả lời" sx={{ mt: 1 }}
            value={answerText} onChange={e => setAnswerText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnsweringId(null)}>Hủy</Button>
          <Button variant="contained" onClick={handleAnswer}>Gửi trả lời</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default MeetingRoom
