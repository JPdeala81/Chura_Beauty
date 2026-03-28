import { createContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'
import * as notificationService from '../services/notificationService'

export const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const token = localStorage.getItem('token')

  useEffect(() => {
    // Écouter les nouvelles notifications en temps réel via Supabase Realtime
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
        playNotificationSound()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications(token)
      setNotifications(response.data.notifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [token])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount(token)
      setUnreadCount(response.data.unreadCount)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [token, fetchNotifications, fetchUnreadCount])

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId, token)
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId, token)
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      )
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3')
    audio.play().catch((err) => console.error('Error playing sound:', err))
  }

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
    fetchNotifications,
    fetchUnreadCount,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
