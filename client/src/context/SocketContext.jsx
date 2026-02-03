import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '../lib/config'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io(API_URL || undefined, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Socket connected')
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      console.log('Socket disconnected')
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
