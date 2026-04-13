#!/usr/bin/env node
import axios from 'axios';

const testSubmitAppointment = async () => {
  try {
    // Get a service to use
    const servRes = await axios.get('http://localhost:5000/api/services');
    const services = servRes.data;
    
    if (!services || !Array.isArray(services) || services.length === 0) {
      console.error('❌ No services returned. Response:', servRes.data);
      process.exit(1);
    }
    
    const serviceId = services[0].id;
    
    console.log('📤 Submitting appointment with complete client data...\n');
    
    const appointmentData = {
      service_id: serviceId,
      client_name: 'Jean Dupont',
      client_phone: '+33612345678',
      client_email: 'jean.dupont@example.com',
      client_whatsapp: '+33687654321',
      desired_date: '2026-04-20',
      slot_start: '14:00',
      slot_end: '14:30',
      selected_options: [],
      custom_description: 'Test appointment with frontend form data'
    };
    
    console.log('Data being sent:');
    console.log(JSON.stringify(appointmentData, null, 2));
    console.log('\n🔄 Waiting for server response...\n');
    
    const response = await axios.post(
      'http://localhost:5000/api/appointments',
      appointmentData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

// Wait 2 seconds to ensure server is ready
setTimeout(() => {
  testSubmitAppointment().then(() => {
    console.log('\n\n📝 Check the server console above for the RAW REQUEST BODY logs!');
    process.exit(0);
  });
}, 2000);
