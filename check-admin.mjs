import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
let NEXT_PUBLIC_SUPABASE_URL = '';
let SUPABASE_SERVICE_ROLE_KEY = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) NEXT_PUBLIC_SUPABASE_URL = line.split('=')[1].replace(/['"]/g, '').trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_SERVICE_ROLE_KEY = line.split('=')[1].replace(/['"]/g, '').trim();
});

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error('Auth User Error:', userError);
  } else {
    console.log('Auth Users:', users.users.map(u => ({ id: u.id, email: u.email })));
  }

  const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
  if (profileError) {
    console.error('Profile Error:', profileError);
  } else {
    console.log('Profiles:', profiles);
  }
}

main();
