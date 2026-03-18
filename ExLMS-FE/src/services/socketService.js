import io from 'socket.io-client'
import store from '../store'
import { addNotification } from '../store/notificationSlice'

let socket;

export const initSocket = () => {
  // Connect to the socket server (replace with your backend URL)
  socket = io('http://localhost:8081', {
    transports: ['websocket'],
    auth: {
      token: localStorage.getItem('token')
    }
  })

  socket.on('connect', () => {
    console.log('Socket.IO connected!')
  })

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected.')
  })

  // Listen for new notifications from the server
  socket.on('new_notification', (notification) => {
    store.dispatch(addNotification(notification))
    // Optionally, show a browser notification
  })

  socket.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err.message)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
  }
}

export const getSocket = () => socket
