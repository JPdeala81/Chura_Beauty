import { supabase } from './supabaseClient';

export const subscribeToAppointments = (callback) => {
  // Subscribe to real-time updates on appointments table
  const subscription = supabase
    .channel('appointments')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'appointments',
      },
      (payload) => {
        // Play notification sound
        playNotificationSound();
        
        // Call callback with the new/updated appointment
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log(`Realtime subscription status: ${status}`);
    });

  return subscription;
};

// Unsubscribe from appointments
export const unsubscribeFromAppointments = (subscription) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};

// Play notification sound
const playNotificationSound = () => {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set frequency and duration
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Sound notification not supported:', error);
  }
};
