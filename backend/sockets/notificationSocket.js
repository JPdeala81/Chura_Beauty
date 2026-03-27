import Notification from '../models/Notification.js';

export const setupNotificationSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('admin:connect', (adminId) => {
      socket.join(`admin:${adminId}`);
      console.log(`Admin ${adminId} connected`);
    });

    socket.on('admin:new_appointment', async (appointmentData) => {
      const notification = await Notification.findByIdAndUpdate(
        appointmentData.notificationId,
        { isRead: false },
        { new: true }
      );

      io.to(`admin:${appointmentData.adminId}`).emit('notification:new_appointment', {
        appointment: appointmentData,
        notification,
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
