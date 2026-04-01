import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('📋 Checking appointments table structure...');
  
  // Get the raw table info from information_schema
  const { data, error } = await supabase
    .rpc('get_table_columns', { table_name: 'appointments' })
    .catch(err => {
      // If RPC doesn't exist, try direct query
      return { data: null, error: err };
    });
  
  if (data) {
    console.log('✅ Columns via RPC:', data);
  } else {
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
        console.log(`  - ${col}: ${appointments[0][col]}`);
      });
    } else {
      console.log('⚠️ Table exists but is empty');
      // Try to know table structure even if empty - retrieve metadata
      const { data: metadata, error: metaError } = await supabase
        .from('appointments')
        .select()
        .limit(0);
      console.log('Metadata check for empty table done');
    }
  }
  
  process.exit(0);
})();
