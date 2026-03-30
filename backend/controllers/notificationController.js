import { supabase } from '../config/supabase.js'

export const getNotifications = async (req, res) => {
  try {
    console.log('📬 Fetching notifications...')
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('❌ Error fetching notifications:', error)
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    console.log(`✅ Found ${notifications.length} notifications`)

    res.status(200).json({
      success: true,
      notifications: notifications || [],
    })
  } catch (error) {
    console.error('❌ Error in getNotifications:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const markNotificationAsRead = async (req, res) => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error || !notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      })
    }

    res.status(200).json({
      success: true,
      notification,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', req.params.id)

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getUnreadCount = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('is_read', false)

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    res.status(200).json({
      success: true,
      unreadCount: count || 0,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
