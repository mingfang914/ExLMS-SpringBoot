import io from 'socket.io-client'
import store from '../store'
import { addNotification } from '../store/notificationSlice'

let socket;

export const initSocket = () => {
  // Bỏ qua lỗi kết nối bằng cách mock sự kiện vì Socket.IO Backend chưa được triển khai.
  socket = {
    on: () => {},
    emit: () => {},
    disconnect: () => {}
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
  }
}

export const getSocket = () => socket
