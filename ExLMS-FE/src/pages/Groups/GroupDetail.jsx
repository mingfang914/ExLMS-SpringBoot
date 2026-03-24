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
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem
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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom'
import groupService from '../../services/groupService'
import courseService from '../../services/courseService'
import assignmentService from '../../services/assignmentService'
import meetingService from '../../services/meetingService'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import GroupMembers from './components/GroupMembers'

const GroupDetail = () => {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [meetings, setMeetings] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  // Dialog States
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [editGroupData, setEditGroupData] = useState({ name: '', description: '', visibility: 'PUBLIC', category: 'General' })
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [newMeetingData, setNewMeetingData] = useState({ title: '', description: '', startAt: '', durationMinutes: 60 })
  const [editMeetingDialogOpen, setEditMeetingDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState(null)
  const [editMeetingData, setEditMeetingData] = useState({ title: '', description: '', startAt: '', durationMinutes: 60 })
  const navigate = useNavigate()

  // Mock meetings
  const mockMeetings = [
    { id: 'meet-1', title: 'Spring Boot Q&A', startAt: 'Today, 3:00 PM', roomName: 'CS2024-Spring-QA' },
    { id: 'meet-2', title: 'Assignment Review', startAt: 'Tomorrow, 10:00 AM', roomName: 'CS2024-Review' }
  ]

  useEffect(() => {
    const fetchGroupData = async () => {
      setLoading(true)
      try {
        const groupData = await groupService.getGroupById(id)
        setGroup(groupData)
        setEditGroupData({
          name: groupData.name || '',
          description: groupData.description || '',
          visibility: groupData.visibility || 'PUBLIC',
          category: groupData.category || 'General'
        })

        if (groupData.isJoined) {
          try {
            const [coursesData, asgnData, meetingsData] = await Promise.all([
              courseService.getCoursesByGroupId(id),
              assignmentService.getAssignmentsByGroup(id),
              meetingService.getMeetingsByGroup(id)
            ])
            setCourses(coursesData)
            setAssignments(asgnData)
            setMeetings(meetingsData)
          } catch (err) {
            console.error('Error fetching group content:', err)
          }
        }
      } catch (err) {
        setError('Failed to load group details.')
      } finally {
        setLoading(false)
      }
    }
    fetchGroupData()
  }, [id])

  const handleJoinGroup = async () => {
    try {
      const response = await groupService.createJoinRequest(id, 'I want to join this group.')
      alert(response || 'Join request sent!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send join request.')
    }
  }

  const handleUpdateGroup = async (e) => {
    e.preventDefault()
    try {
      await groupService.updateGroup(id, editGroupData)
      setGroup({ ...group, ...editGroupData })
      setManageDialogOpen(false)
      alert('Cập nhật thông tin thành công!')
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi cập nhật!')
    }
  }

  const handleDeleteGroup = async () => {
    if (deleteConfirmText !== group.name) {
      alert('Tên xác nhận không khớp!')
      return
    }
    if (window.confirm('Hành động này không thể hoàn tác. Bạn chắc chắn chứ?')) {
      try {
        await groupService.deleteGroup(id)
        alert('Đã xóa nhóm học tập!')
        navigate('/groups')
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi xóa nhóm!')
      }
    }
  }

  const handleScheduleMeeting = async (e) => {
    e.preventDefault()
    try {
      await meetingService.scheduleMeeting(id, newMeetingData)
      const freshMeetings = await meetingService.getMeetingsByGroup(id)
      setMeetings(freshMeetings)
      setScheduleDialogOpen(false)
      setNewMeetingData({ title: '', description: '', startAt: '', durationMinutes: 60 })
      alert('Đã lên lịch buổi họp!')
    } catch (err) {
      alert('Lỗi khi lên lịch buổi họp!')
    }
  }

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa buổi họp này?')) {
      try {
        await meetingService.deleteMeeting(meetingId)
        setMeetings(meetings.filter(m => m.id !== meetingId))
        alert('Đã xóa buổi họp!')
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi xóa buổi họp!')
      }
    }
  }

  const handleOpenEditMeeting = (meeting) => {
    setEditingMeeting(meeting)
    // Format startAt for datetime-local input (YYYY-MM-DDTHH:mm)
    const date = new Date(meeting.startAt)
    const formattedDate = date.toISOString().slice(0, 16)
    setEditMeetingData({
      title: meeting.title,
      description: meeting.description || '',
      startAt: formattedDate,
      durationMinutes: meeting.durationMinutes
    })
    setEditMeetingDialogOpen(true)
  }

  const handleUpdateMeeting = async (e) => {
    e.preventDefault()
    try {
      await meetingService.updateMeeting(editingMeeting.id, editMeetingData)
      const freshMeetings = await meetingService.getMeetingsByGroup(id)
      setMeetings(freshMeetings)
      setEditMeetingDialogOpen(false)
      alert('Đã cập nhật buổi họp!')
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật buổi họp!')
    }
  }

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
            {group.isJoined && <Tab icon={<CourseIcon />} iconPosition="start" label="Courses" />}
            {group.isJoined && <Tab icon={<AssignmentIcon />} iconPosition="start" label="Assignments" />}
            {group.isJoined && <Tab icon={<MeetingIcon />} iconPosition="start" label="Meetings" />}
            {group.isJoined && <Tab icon={<ForumIcon />} iconPosition="start" label="Feed" />}
            {group.isJoined && <Tab icon={<PeopleIcon />} iconPosition="start" label="Members" />}
          </Tabs>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!group.isJoined ? (
              <Button variant="contained" color="secondary" onClick={handleJoinGroup}>
                Join Group
              </Button>
            ) : (
              <>
                {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                  <>
                    <Tooltip title="Share group">
                      <IconButton onClick={() => setShareDialogOpen(true)}><ShareIcon /></IconButton>
                    </Tooltip>
                    {group.currentUserRole === 'OWNER' && (
                      <Button variant="contained" startIcon={<SettingsIcon />} onClick={() => setManageDialogOpen(true)}>Manage</Button>
                    )}
                  </>
                )}
              </>
            )}
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
              {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to={`/groups/${id}/courses/create`}
                >
                  Create Course
                </Button>
              )}
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
                      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          component={RouterLink}
                          to={`/groups/${id}/courses/${course.id}/view`}
                        >
                          Học ngay
                        </Button>
                        {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                          <Button
                            variant="outlined"
                            component={RouterLink}
                            to={`/groups/${id}/courses/${course.id}/edit`}
                          >
                            Sửa
                          </Button>
                        )}
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to={`/groups/${id}/assignments/create`}
                  >
                    Create
                  </Button>
                )}
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to={`/groups/${id}/assignments`}
                >
                  View All
                </Button>
              </Box>
            </Box>
            
            {assignments.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">No assignments available yet.</Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {assignments.slice(0, 6).map((asgn) => (
                  <Grid item xs={12} key={asgn.id}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
                        transition: 'all 0.2s',
                        borderRadius: 2
                      }}
                    >
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '16px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                            <AssignmentIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{asgn.title}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Due: {format(new Date(asgn.dueAt), 'HH:mm dd/MM/yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                        <Button 
                          variant="text" 
                          component={RouterLink} 
                          to={`/groups/${id}/assignments/${asgn.id}`}
                        >
                          Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {assignments.length > 6 && (
                  <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
                    <Button component={RouterLink} to={`/groups/${id}/assignments`}>
                      See all {assignments.length} assignments
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Online Meetings</Typography>
              {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                <Button 
                  variant="contained" 
                  startIcon={<MeetingIcon />}
                  onClick={() => setScheduleDialogOpen(true)}
                >
                  Schedule Meeting
                </Button>
              )}
            </Box>
            <Grid container spacing={3}>
              {meetings.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 5, textAlign: 'center' }}>
                    <Typography color="text.secondary">No meetings scheduled yet.</Typography>
                  </Paper>
                </Grid>
              ) : (
                meetings.map((meeting) => (
                  <Grid item xs={12} md={6} key={meeting.id}>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderRadius: 2,
                        '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{meeting.title}</Typography>
                          {meeting.status === 'LIVE' && <Chip label="LIVE" color="error" size="small" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(meeting.startAt), 'HH:mm dd/MM/yyyy')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                          <Box sx={{ display: 'flex', mr: 1 }}>
                            {meeting.status === 'SCHEDULED' && (
                              <Tooltip title="Chỉnh sửa">
                                <IconButton size="small" onClick={() => handleOpenEditMeeting(meeting)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {meeting.status !== 'LIVE' && (
                              <Tooltip title="Xóa">
                                <IconButton size="small" color="error" onClick={() => handleDeleteMeeting(meeting.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                        <Button
                          variant="contained"
                          component={RouterLink}
                          to={`/groups/${id}/meetings/${meeting.id}`}
                        >
                          {meeting.status === 'ENDED' ? 'View Report' : 'Join'}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        )}

        {/* Placeholder for other tabs */}
        {activeTab === 4 && (
          <Paper sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">This feature is coming soon.</Typography>
          </Paper>
        )}

        {activeTab === 5 && (
          <Paper sx={{ p: 3 }}>
            <GroupMembers groupId={id} groupRole={group.currentUserRole} />
          </Paper>
        )}
      </Box>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Mời thành viên mới</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Gửi mã mời này cho bạn bè hoặc học viên để họ có thể tham gia vào nhóm học tập.
          </DialogContentText>
          <Box sx={{ p: 3, mt: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center', border: '1px dashed grey' }}>
            <Typography variant="h4" fontWeight="bold" letterSpacing={6} color="primary">
              {group?.inviteCode || 'N/A'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Đóng</Button>
          <Button variant="contained" onClick={() => { navigator.clipboard.writeText(group.inviteCode); alert('Đã chép mã!'); }}>
            Copy Mã
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Dialog */}
      <Dialog open={manageDialogOpen} onClose={() => setManageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quản lý Nhóm học tập</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdateGroup} sx={{ mt: 2 }}>
            <TextField fullWidth label="Tên nhóm" margin="normal" value={editGroupData.name} onChange={(e) => setEditGroupData({...editGroupData, name: e.target.value})} required />
            <TextField fullWidth label="Mô tả" margin="normal" multiline rows={3} value={editGroupData.description} onChange={(e) => setEditGroupData({...editGroupData, description: e.target.value})} />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField fullWidth select label="Chế độ hiển thị" value={editGroupData.visibility} onChange={(e) => setEditGroupData({...editGroupData, visibility: e.target.value})}>
                  <MenuItem value="PUBLIC">Công khai (Public)</MenuItem>
                  <MenuItem value="PRIVATE">Riêng tư (Private)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Danh mục" placeholder="Ví dụ: IT, Toán..." value={editGroupData.category} onChange={(e) => setEditGroupData({...editGroupData, category: e.target.value})} />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }} fullWidth>Lưu Thay Đổi</Button>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>Khu vực nguy hiểm (Xóa nhóm)</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Để xác nhận xóa, vui lòng nhập chính xác tên nhóm: <strong>{group.name}</strong>
          </Typography>
          <TextField fullWidth size="small" placeholder={group.name} value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} sx={{ mb: 2 }} />
          <Button variant="outlined" color="error" fullWidth onClick={handleDeleteGroup} disabled={deleteConfirmText !== group.name}>
            XÓA NHÓM NÀY CHẮC CHẮN
          </Button>
        </DialogContent>
      </Dialog>
      {/* Schedule Meeting Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lên lịch buổi họp trực tuyến</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleScheduleMeeting} sx={{ mt: 2 }}>
            <TextField 
              fullWidth label="Tiêu đề" margin="normal" required
              value={newMeetingData.title} 
              onChange={(e) => setNewMeetingData({...newMeetingData, title: e.target.value})} 
            />
            <TextField 
              fullWidth label="Mô tả" margin="normal" multiline rows={2}
              value={newMeetingData.description} 
              onChange={(e) => setNewMeetingData({...newMeetingData, description: e.target.value})} 
            />
            <TextField 
              fullWidth label="Thời gian bắt đầu" margin="normal" type="datetime-local" required
              InputLabelProps={{ shrink: true }}
              value={newMeetingData.startAt} 
              onChange={(e) => setNewMeetingData({...newMeetingData, startAt: e.target.value})} 
            />
            <TextField 
              fullWidth label="Thời lượng (phút)" margin="normal" type="number" required
              value={newMeetingData.durationMinutes} 
              onChange={(e) => setNewMeetingData({...newMeetingData, durationMinutes: e.target.value})} 
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
              Tạo buổi họp
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={editMeetingDialogOpen} onClose={() => setEditMeetingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa buổi họp</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdateMeeting} sx={{ mt: 2 }}>
            <TextField 
              fullWidth label="Tiêu đề" margin="normal" required
              value={editMeetingData.title} 
              onChange={(e) => setEditMeetingData({...editMeetingData, title: e.target.value})} 
            />
            <TextField 
              fullWidth label="Mô tả" margin="normal" multiline rows={2}
              value={editMeetingData.description} 
              onChange={(e) => setEditMeetingData({...editMeetingData, description: e.target.value})} 
            />
            <TextField 
              fullWidth label="Thời gian bắt đầu" margin="normal" type="datetime-local" required
              InputLabelProps={{ shrink: true }}
              value={editMeetingData.startAt} 
              onChange={(e) => setEditMeetingData({...editMeetingData, startAt: e.target.value})} 
            />
            <TextField 
              fullWidth label="Thời lượng (phút)" margin="normal" type="number" required
              value={editMeetingData.durationMinutes} 
              onChange={(e) => setEditMeetingData({...editMeetingData, durationMinutes: e.target.value})} 
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
              Cập nhật buổi họp
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default GroupDetail
