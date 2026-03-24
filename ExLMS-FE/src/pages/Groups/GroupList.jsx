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

  const fetchGroups = async (tab = activeTab) => {
    setLoading(true)
    setError(null)
    try {
      let data
      if (tab === 1) {
        // My Groups: fetch all groups the user has joined (includes private ones)
        data = await groupService.getMyGroups()
      } else {
        // All Groups: public only
        data = await groupService.getAllPublicGroups()
      }
      setGroups(data)
    } catch (err) {
      setError('Failed to fetch groups. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups(activeTab)
  }, [activeTab])

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

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) return
    setInviteLoading(true)
    try {
      const response = await groupService.joinGroupByInviteCode(inviteCode)
      setSnackbar({ open: true, message: response || 'Successfully joined the group!', severity: 'success' })
      setInviteDialogOpen(false)
      setInviteCode('')
      fetchGroups() // Refresh list just in case
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Invalid invite code or already joined.', severity: 'error' })
    } finally {
      setInviteLoading(false)
    }
  }

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
            onClick={() => fetchGroups(activeTab)}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            onClick={() => setInviteDialogOpen(true)}
          >
            Join with Code
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

      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
        <DialogTitle>Join Group with Invite Code</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            If you have received an invite code from a group owner, enter it below to join immediately.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Invite Code"
            type="text"
            fullWidth
            variant="outlined"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleJoinByCode} variant="contained" disabled={inviteLoading || !inviteCode.trim()}>
            {inviteLoading ? <CircularProgress size={24} /> : 'Join'}
          </Button>
        </DialogActions>
      </Dialog>

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
