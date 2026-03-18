import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
}

// Mock initial notifications
const mockNotifications = [
  { id: 1, message: 'New assignment "Final Project" has been posted.', read: false, createdAt: new Date().toISOString() },
  { id: 2, message: 'Your submission for "API Implementation" was graded.', read: false, createdAt: new Date().toISOString() },
  { id: 3, message: 'Meeting "Weekly Sync" is starting in 15 minutes.', read: true, createdAt: new Date().toISOString() },
]

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter(n => !n.read).length
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount++
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount--
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.read = false })
      state.unreadCount = 0
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.read).length
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  setNotifications
} = notificationSlice.actions

export default notificationSlice.reducer
