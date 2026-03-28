// Notification Socket - Real-time updates
export const setupNotificationSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Admin joins their notification room
    socket.on('admin:connect', (adminId) => {
      socket.join(`admin:${adminId}`);
      console.log(`Admin ${adminId} connected to notifications`);
    });

    // Broadcast new appointment notification to admin
    socket.on('admin:new_appointment', (appointmentData) => {
      io.to(`admin:${appointmentData.adminId}`).emit('notification:new_appointment', {
        appointment: appointmentData,
        timestamp: new Date(),
      });
    });

    // Admin marks notification as read
    socket.on('notification:mark_read', (notificationId) => {
      console.log(`Notification ${notificationId} marked as read`);
      // Database update happens via API (notificationController.js), 
      // this just updates real-time status
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
