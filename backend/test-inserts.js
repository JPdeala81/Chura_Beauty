import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const testInserts = async () => {
  console.log('Testing different insertion scenarios...\n');
  
  // Get a service ID
  const { data: services } = await supabase.from('services').select('id').limit(1);
  const serviceId = services?.[0]?.id;
  
  if (!serviceId) {
    console.error('❌ No services found');
    process.exit(1);
  }
  
  const testDate = new Date().toISOString().split('T')[0];
  
  // Test 1: Insert with all fields (non-empty)
  console.log('Test 1: Insert with all client fields populated');
  const { data: result1, error: error1 } = await supabase
    .from('appointments')
    .insert([{
      service_id: serviceId,
      client_name: 'Test User 1',
      client_phone: '+33612345678',
      client_email: 'test1@example.com',
      client_whatsapp: '+33687654321',
      appointment_date: testDate,
      status: 'pending',
      user_id: randomUUID(),
      revenue: 0
    }])
    .select();
  
  if (error1) {
    console.log('❌ Error:', error1.message);
  } else {
    console.log('✅ Success. Saved data:');
    console.log(JSON.stringify({
      client_name: result1[0].client_name,
      client_phone: result1[0].client_phone,
      client_email: result1[0].client_email,
      client_whatsapp: result1[0].client_whatsapp
    }, null, 2));
  }
  
  // Test 2: Insert with empty strings
  console.log('\n\nTest 2: Insert with EMPTY STRING values');
  const { data: result2, error: error2 } = await supabase
    .from('appointments')
    .insert([{
      service_id: serviceId,
      client_name: '',
      client_phone: '',
      client_email: '',
      client_whatsapp: '',
      appointment_date: testDate,
      status: 'pending',
      user_id: randomUUID(),
      revenue: 0
    }])
    .select();
  
  if (error2) {
    console.log('❌ Error:', error2.message);
  } else {
    console.log('✅ Success. Saved data:');
    console.log(JSON.stringify({
      client_name: result2[0].client_name,
      client_phone: result2[0].client_phone,
      client_email: result2[0].client_email,
      client_whatsapp: result2[0].client_whatsapp
    }, null, 2));
    console.log('⚠️  Notice: Are empty strings being converted to NULL?');
  }
  
  // Test 3: Insert with undefined (fields not included in insert object)
  console.log('\n\nTest 3: Insert WITHOUT including client fields (undefined)');
  const { data: result3, error: error3 } = await supabase
    .from('appointments')
    .insert([{
      service_id: serviceId,
      appointment_date: testDate,
      status: 'pending',
      user_id: randomUUID(),
      revenue: 0
      // NO client fields at all
    }])
    .select();
  
  if (error3) {
    console.log('❌ Error:', error3.message);
  } else {
    console.log('✅ Success. Saved data:');
    console.log(JSON.stringify({
      client_name: result3[0].client_name,
      client_phone: result3[0].client_phone,
      client_email: result3[0].client_email,
      client_whatsapp: result3[0].client_whatsapp
    }, null, 2));
    console.log('⚠️  Expected result: all NULL (not included in insert)');
  }
  
  // Test 4: Insert with whitespace
  console.log('\n\nTest 4: Insert with WHITESPACE only');
  const { data: result4, error: error4 } = await supabase
    .from('appointments')
    .insert([{
      service_id: serviceId,
      client_name: '   ',
      client_phone: '  ',
      client_email: '   ',
      client_whatsapp: '  ',
      appointment_date: testDate,
      status: 'pending',
      user_id: randomUUID(),
      revenue: 0
    }])
    .select();
  
  if (error4) {
    console.log('❌ Error:', error4.message);
  } else {
    console.log('✅ Success. Saved data:');
    console.log(JSON.stringify({
      client_name: `'${result4[0].client_name}'`,
      client_phone: `'${result4[0].client_phone}'`,
      client_email: `'${result4[0].client_email}'`,
      client_whatsapp: `'${result4[0].client_whatsapp}'`
    }, null, 2));
  }
  
  console.log('\n\n📊 SUMMARY:');
  console.log('Test 1: Non-empty strings should save as-is');
  console.log('Test 2: Empty strings might be converted to NULL or saved as empty');
  console.log('Test 3: Undefined fields result in NULL (fields not in INSERT statement)');
  console.log('Test 4: Whitespace is preserved (not trimmed by Supabase)');
  console.log('\n💡 KEY FINDING: If all client fields are NULL in saved appointments, it suggests:');
  console.log('   - Fields were NOT in the INSERT statement (undefined), OR');
  console.log('   - Fields were/are receiving empty values from the form, OR');
  console.log('   - Fields are being stripped somewhere in the request chain');
  
  process.exit(0);
};

testInserts();
