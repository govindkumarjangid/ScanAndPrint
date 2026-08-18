import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => {
  if (!socket) {
    const rawUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const socketUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '')

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      timeout: 20000,
    })

    socket.on('connect', () => {
      console.log('⚡ [Dashboard Socket Connected]:', socket.id)
    })

    socket.on('disconnect', () => {
      console.log('🔌 [Dashboard Socket Disconnected]')
    })
  }

  return socket
}
