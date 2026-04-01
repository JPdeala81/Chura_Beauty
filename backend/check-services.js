import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('📋 Checking services table structure...');
  
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
  
  if (services.length > 0) {
    console.log('✅ Services table structure:');
    Object.keys(services[0]).forEach(column => {
      console.log(`  - ${column}: ${services[0][column]}`);
    });
  } else {
    console.log('✅ Services table exists but is empty');
    console.log('📊 Inserting sample services...');
    
    const sampleServices = [
      {
        title: 'Manucure Classique',
        description: 'Manucure française classique avec vernis de qualité',
        category: 'Manucure',
        price: 35,
        duration: 30
      },
      {
        title: 'Pédicure Spa',
        description: 'Pédicure complète avec massage relaxant',
        category: 'Pédicure',
        price: 45,
        duration: 45
      }
    ];
    
    const { data, error: insertError } = await supabase
      .from('services')
      .insert(sampleServices)
      .select();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
    } else {
      console.log('✅ Inserted', data.length, 'services');
    }
  }
  
  process.exit(0);
})();
