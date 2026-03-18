import React from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Notifications as NotificationIcon,
  CheckCircleOutline as ReadIcon,
  Circle as UnreadIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { markAsRead, markAllAsRead } from '../store/notificationSlice'

const Notifications = () => {
  const { notifications } = useSelector((state) => state.notifications)
  const dispatch = useDispatch()

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id))
  }

  return (
    <Box maxWidth="md" mx="auto">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>All Notifications</Typography>
        <Button variant="outlined" onClick={() => dispatch(markAllAsRead())}>
          Mark all as read
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <Typography color="text.secondary">You have no notifications.</Typography>
            </Box>
          ) : (
            notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  sx={{
                    p: 3,
                    bgcolor: notif.read ? 'transparent' : 'action.hover',
                    transition: 'background-color 0.3s'
                  }}
                  secondaryAction={
                    <Box>
                      {!notif.read && (
                        <Tooltip title="Mark as read">
                          <IconButton edge="end" onClick={() => handleMarkAsRead(notif.id)} sx={{ mr: 1 }}>
                            <ReadIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton edge="end">
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notif.read ? 'grey.300' : 'primary.light', color: notif.read ? 'grey.600' : 'primary.main' }}>
                      <NotificationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: notif.read ? 'normal' : 'bold' }}>
                          {notif.message}
                        </Typography>
                        {!notif.read && <UnreadIcon color="primary" sx={{ fontSize: 12 }} />}
                      </Box>
                    }
                    secondary={new Date(notif.createdAt).toLocaleString()}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  )
}

export default Notifications
