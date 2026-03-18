import React, { useState, useEffect } from 'react'
import {
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import groupService from '../../services/groupService'
import GroupCard from '../../components/Groups/GroupCard'

const GroupList = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState(0) // 0: All, 1: My Groups (Optional)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const fetchGroups = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await groupService.getAllPublicGroups()
      setGroups(data)
    } catch (err) {
      setError('Failed to fetch groups. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleJoinGroup = async (groupId) => {
    try {
      // Logic for joining public group (e.g., sending join request)
      const response = await groupService.createJoinRequest(groupId, 'I want to join this group.')
      setSnackbar({ open: true, message: response || 'Join request sent!', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to send join request.', severity: 'error' })
    }
  }

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (group.category && group.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Study Groups</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchGroups}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/groups/create"
          >
            Create Group
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search groups by name or category..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="All Groups" />
              <Tab label="My Groups" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : filteredGroups.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 10, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">No groups found.</Typography>
          <Button variant="text" sx={{ mt: 2 }} onClick={() => setSearchTerm('')}>Clear Search</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredGroups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <GroupCard group={group} onJoin={handleJoinGroup} />
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default GroupList
