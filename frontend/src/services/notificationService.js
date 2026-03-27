import api from './api';

export const getNotifications = (token) => {
  return api.get('/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUnreadCount = (token) => {
  return api.get('/notifications/unread/count', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markAsRead = (notificationId, token) => {
  return api.patch(`/notifications/${notificationId}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteNotification = (notificationId, token) => {
  return api.delete(`/notifications/${notificationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
