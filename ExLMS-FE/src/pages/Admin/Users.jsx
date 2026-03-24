import React, { useState, useEffect } from 'react'
import {
  Container, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Button, TextField, Select, MenuItem,
  Chip, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import DownloadIcon from '@mui/icons-material/Download'
import SearchIcon from '@mui/icons-material/Search'
import adminService from '../../services/adminService'
import { useSelector } from 'react-redux'

const Users = () => {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('STUDENT')

  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusToChange, setStatusToChange] = useState(null)

  const { user: currentUser } = useSelector(state => state.auth)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getUsers(page, rowsPerPage, keyword)
      setUsers(data.content)
      setTotalElements(data.totalElements)
    } catch (err) {
      console.error('Failed to fetch users', err)
      alert(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, rowsPerPage, keyword])

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(0)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const openStatusDialog = (user, newStatus) => {
    setSelectedUser(user)
    setStatusToChange(newStatus)
    setStatusDialogOpen(true)
  }

  const handleStatusChange = async () => {
    try {
      await adminService.changeUserStatus(selectedUser.id, statusToChange)
      setStatusDialogOpen(false)
      fetchUsers()
      alert('Status updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    }
  }

  const openRoleDialog = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setRoleDialogOpen(true)
  }

  const handleRoleChange = async () => {
    try {
      await adminService.changeUserRole(selectedUser.id, newRole)
      setRoleDialogOpen(false)
      fetchUsers()
      alert('Role updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role')
    }
  }

  const handleExportExcel = () => {
    const token = localStorage.getItem('token')
    fetch(adminService.exportUsersCsvUrl(), {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'users_export.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    })
    .catch(err => alert('Failed to export Excel'))
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            User Management
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSearch} display="flex" gap={2} mb={3}>
          <TextField
            label="Search by Name or Email"
            variant="outlined"
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
            Search
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No users found.</TableCell></TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={user.role === 'ADMIN' ? 'error' : user.role === 'INSTRUCTOR' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status} 
                        color={user.status === 'ACTIVE' ? 'success' : user.status === 'PENDING' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {currentUser?.role === 'ADMIN' && user.email !== currentUser.email && (
                        <Box display="flex" gap={1}>
                          {user.status !== 'ACTIVE' && (
                            <Tooltip title="Activate / Approve">
                              <IconButton color="success" onClick={() => openStatusDialog(user, 'ACTIVE')} size="small">
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {user.status === 'ACTIVE' && (
                            <Tooltip title="Suspend / Block">
                              <IconButton color="error" onClick={() => openStatusDialog(user, 'SUSPENDED')} size="small">
                                <BlockIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Change Role">
                            <IconButton color="primary" onClick={() => openRoleDialog(user)} size="small">
                              <ManageAccountsIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent sx={{ minWidth: 300, mt: 1 }}>
          <Typography variant="body2" mb={2}>
            Select a new role for {selectedUser?.fullName}
          </Typography>
          <Select
            fullWidth
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <MenuItem value="STUDENT">Student</MenuItem>
            <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRoleChange}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent sx={{ minWidth: 300, mt: 1 }}>
          <Typography variant="body1">
            Are you sure you want to change the status of <strong>{selectedUser?.fullName}</strong> to <strong>{statusToChange}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color={statusToChange === 'ACTIVE' ? 'success' : 'error'} onClick={handleStatusChange}>
            Confirm Change
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Users
