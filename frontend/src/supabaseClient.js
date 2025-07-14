import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://<your-project-id>.supabase.co',
  '<your-anon-key>'
);

export default supabase;
