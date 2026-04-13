import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Test appointment submission
const testAppointment = async () => {
  try {
    // First, get a service ID from the database
    const servicesRes = await axios.get('http://localhost:5000/api/services');
    const services = servicesRes.data;
    
    if (!services || services.length === 0) {
      console.error('❌ No services found. Create a service first.');
      process.exit(1);
    }
    
    const serviceId = services[0].id;
    console.log(`✅ Using service: ${serviceId}`);
    
    // Submit a test appointment with ALL fields filled
    const appointmentData = {
      service_id: serviceId,
      client_name: 'Test Client ' + new Date().getTime(),
      client_phone: '+33612345678',
      client_email: 'test@example.com',
      client_whatsapp: '+33687654321',
      desired_date: '2026-04-25',
      slot_start: '10:00',
      slot_end: '10:30',
      selected_options: [],
      custom_description: 'Test appointment with all fields'
    };
    
    console.log('\n📤 Sending appointment data:');
    console.log(JSON.stringify(appointmentData, null, 2));
    
    const response = await axios.post(
      'http://localhost:5000/api/appointments',
      appointmentData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ Appointment created:', response.data);
    
    if (response.data.success && response.data.appointment) {
      const apptId = response.data.appointment.id;
      console.log(`\n🔍 Checking saved data for appointment ${apptId}...`);
      
      // Wait a moment then check what was saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const getRes = await axios.get(
        `http://localhost:5000/api/appointments/${apptId}`,
        {
          headers: {
            'Authorization': 'Bearer test-token'
          }
        }
      );
      
      console.log('\n📥 Saved appointment data:');
      console.log(JSON.stringify(getRes.data.appointment, null, 2));
      
      // Check if client data was saved
      if (!getRes.data.appointment.client_name) {
        console.log('\n⚠️  WARNING: client_name is NULL or empty!');
      }
      if (!getRes.data.appointment.client_phone) {
        console.log('⚠️  WARNING: client_phone is NULL or empty!');
      }
      if (!getRes.data.appointment.client_email) {
        console.log('⚠️  WARNING: client_email is NULL or empty!');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testAppointment().then(() => process.exit(0));
