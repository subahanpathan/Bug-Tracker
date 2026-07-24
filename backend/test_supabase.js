import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Connecting to:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);
console.log('Service Key length:', supabaseServiceKey ? supabaseServiceKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying users...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase query error:', error);
    } else {
      console.log('Supabase query success:', data);
    }
  } catch (err) {
    console.error('Catch error:', err);
  }
}

run();
