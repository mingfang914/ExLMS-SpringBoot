import React, { useState, useEffect } from 'react'
import {
  Container, Paper, Typography, Box, TextField, Button, Avatar, 
  Grid, CircularProgress, Alert
} from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import api from '../services/api'
import { setUser } from '../store/authSlice'
import FileUpload from '../components/Common/FileUpload'

const Profile = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    avatarKey: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Tải thông tin hồ sơ chi tiết từ API
    const fetchProfileData = async () => {
      setLoading(true)
      try {
        const res = await api.get('/users/me')
        setProfileData({
          fullName: res.data.fullName || '',
          bio: res.data.bio || '',
          avatarKey: res.data.avatarKey || ''
        })
      } catch (err) {
        console.error('Lỗi khi tải Profile', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfileData()
  }, [])

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')
    
    try {
      const res = await api.put('/users/me/profile', profileData)
      setSuccessMsg(res.data || 'Cập nhật cấu hình thành công!')
      
      // Update the Redux user state as well so the Header reflects changes
      const userRes = await api.get('/users/me')
      dispatch(setUser(userRes.data))
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Không thể lưu hồ sơ.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }} className="glass-panel">
        <Typography variant="h5" component="h1" fontWeight={700} mb={4}>
          Personal Profile
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSave}>
            {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}
            {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
                <Avatar 
                  src={profileData.avatarKey || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format"} 
                  sx={{ width: 140, height: 140, mb: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                />
                <Box width="100%">
                  <FileUpload
                    onUploadSuccess={(fileKey) => setProfileData(prev => ({ ...prev, avatarKey: fileKey }))}
                    accept="image/*"
                    label="Upload New Avatar"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  JPG, GIF or PNG. Max size of 1MB.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Email (View Only)"
                  value={user?.email || ''}
                  disabled
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="Bio / Introduction"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Tell us a little bit about yourself..."
                  sx={{ mb: 4 }}
                />
                
                <Box display="flex" justifyContent="flex-end">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={saving}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default Profile
