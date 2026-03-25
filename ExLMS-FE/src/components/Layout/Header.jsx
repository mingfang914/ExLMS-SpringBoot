import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Divider,
  Button
} from '@mui/material'
import {
  NotificationsOutlined as NotificationIcon,
  PersonOutline as UserIcon,
  LogoutOutlined as LogoutIcon,
  SettingsOutlined as SettingsIcon,
  Circle as UnreadIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import { markAsRead, markAllAsRead } from '../../store/notificationSlice'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import { motion, AnimatePresence } from 'framer-motion'

const Header = () => {
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [anchorElNotif, setAnchorElNotif] = useState(null)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { notifications, unreadCount } = useSelector((state) => state.notifications)

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
  const handleCloseUserMenu = () => setAnchorElUser(null)

  const handleOpenNotifMenu = (event) => setAnchorElNotif(event.currentTarget)
  const handleCloseNotifMenu = () => setAnchorElNotif(null)

  const handleLogout = () => {
    handleCloseUserMenu()
    authService.logout()
    dispatch(logout())
  }

  const handleNotificationClick = (id) => {
    dispatch(markAsRead(id))
  }

  const handleViewAllNotifications = () => {
    handleCloseNotifMenu()
    navigate('/notifications')
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: { sm: `calc(100% - 240px)` },
        ml: { sm: `240px` },
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
      }}
      className="glass-panel"
    >
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleOpenNotifMenu}
              sx={{ 
                bgcolor: 'rgba(79, 70, 229, 0.05)',
                '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.1)' },
                transition: 'all 0.2s'
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    boxShadow: '0 0 0 2px #fff',
                  }
                }}
              >
                <NotificationIcon sx={{ color: 'text.secondary' }} />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Popover
            open={Boolean(anchorElNotif)}
            anchorEl={anchorElNotif}
            onClose={handleCloseNotifMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ 
              sx: { width: 360, maxHeight: 450, mt: 1.5 },
              className: 'glass-panel'
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={() => dispatch(markAllAsRead())} sx={{ fontSize: '0.8rem' }}>
                  Mark all read
                </Button>
              )}
            </Box>
            <Divider />
            <List sx={{ p: 0 }}>
              {notifications.length === 0 ? (
                <ListItem sx={{ py: 4, justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">You have no new notifications.</Typography>
                </ListItem>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <React.Fragment key={notif.id}>
                    <ListItem
                      button
                      onClick={() => handleNotificationClick(notif.id)}
                      sx={{ 
                        bgcolor: notif.read ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                        transition: 'background-color 0.2s',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: notif.read ? 'grey.200' : 'secondary.light', color: notif.read ? 'grey.600' : 'white', width: 36, height: 36 }}>
                          <NotificationIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={notif.message}
                        secondary={new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: notif.read ? 400 : 600, color: 'text.primary' }}
                        secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      />
                      {!notif.read && <UnreadIcon color="secondary" sx={{ fontSize: 10, ml: 1 }} />}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button size="small" fullWidth onClick={handleViewAllNotifications} sx={{ fontWeight: 600 }}>
                View All
              </Button>
            </Box>
          </Popover>

          {/* User Menu */}
          <Tooltip title="User Profile">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Avatar 
                  alt={user?.email || 'User'} 
                  src={user?.avatarKey ? `http://localhost:3000/api/files/download/${user.avatarKey}` : (user?.avatarUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format")} 
                  sx={{ 
                    width: 40, height: 40, 
                    border: '2px solid rgba(79, 70, 229, 0.2)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }} 
                />
              </motion.div>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.1))',
                mt: 1.5,
                borderRadius: 2,
                minWidth: 180,
                padding: 1,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 18,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1, mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                {user?.name || user?.fullName || 'Student'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'student@exlms.edu'}
              </Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }} sx={{ borderRadius: 1.5, mb: 0.5 }}>
              <ListItemIcon><UserIcon fontSize="small" /></ListItemIcon>
              <ListItemText>My Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCloseUserMenu} sx={{ borderRadius: 1.5, mb: 0.5 }}>
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ borderRadius: 1.5, color: 'error.main' }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
