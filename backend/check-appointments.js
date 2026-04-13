import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('📋 Checking appointments table structure...');
  
  try {
    // Try to select with *
    const { data: appointments, error: selectError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
  
    if (selectError) {
      console.log('❌ Error:', selectError.message);
    } else if (appointments && appointments.length > 0) {
      console.log('✅ Appointments table columns:');
      Object.keys(appointments[0]).forEach(col => {
        console.log(`  - ${col}`);
      });
      console.log('\n📊 First appointment data:');
      console.log(JSON.stringify(appointments[0], null, 2));
    } else {
      console.log('⚠️ Table exists but is empty - checking with select()');
      // Get empty result to see schema
      const { error: emptyError } = await supabase
        .from('appointments')
        .select()
        .limit(0);
      console.log('Query result:', emptyError ? emptyError.message : 'Success but no rows');
    }
  } catch (e) {
    console.error('Exception:', e.message);
  }
  
  process.exit(0);
})();
