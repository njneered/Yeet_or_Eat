import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qsqoaolnqlbwlkfelkmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzcW9hb2xucWxid2xrZmVsa21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MjQ3MTMsImV4cCI6MjA2ODEwMDcxM30.KcIXtIIljuRPQwSEnypcvh-btBqVufQbzTAI-9SzurE'
);

export default supabase;
