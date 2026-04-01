import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const validHash = '$2a$10$74gxVhEo2uK2GW7o3gpOteOHpnNRctLYGuB0V3zN5TMsqt0LP3QNG';
  
  const { data, error } = await supabase
    .from('admins')
    .update({ password: validHash })
    .in('email', ['admin@chura-beauty.dev', 'developer@chura-beauty.dev'])
    .select();
  
  if (error) {
    console.log('❌ Erreur:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Hash bcrypt mis à jour pour', data.length, 'admins');
    console.log('Admins mis à jour:', data.map(a => a.email));
    process.exit(0);
  }
})();
