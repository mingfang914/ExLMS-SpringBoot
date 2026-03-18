import React from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
  Box,
  Typography,
  Avatar
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Book as CourseIcon,
  Forum as ForumIcon,
  Event as CalendarIcon,
  Notifications as NotificationIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const drawerWidth = 240

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Study Groups', icon: <GroupIcon />, path: '/groups' },
    { text: 'Courses', icon: <CourseIcon />, path: '/courses' },
    { text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments' },
    { text: 'Forum', icon: <ForumIcon />, path: '/forum' },
    { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Notifications', icon: <NotificationIcon />, path: '/notifications' },
  ]

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          borderRight: 'none', // Removed default border, using glass-sidebar class
        },
      }}
      PaperProps={{
        className: 'glass-sidebar'
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontWeight: 'bold' }}>E</Avatar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '-0.5px', color: 'text.primary' }}>
            ExLMS<span style={{color: '#4f46e5'}}>.</span>
          </Typography>
        </Box>
      </Toolbar>
      <Box sx={{ overflow: 'auto', mt: 2, px: 2 }}>
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      }
                    },
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.main' : 'rgba(79, 70, 229, 0.08)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40,
                    color: isActive ? 'inherit' : 'text.secondary',
                    transition: 'color 0.2s'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'inherit' : 'text.primary',
                      fontSize: '0.95rem'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>
    </Drawer>
  )
}

export default Sidebar
