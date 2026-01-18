import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xokduhssevaaxzmhcpxf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhva2R1aHNzZXZhYXh6bWhjcHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjE4MTMsImV4cCI6MjA4MTkzNzgxM30.0q32XGPyy1lGZyCBMnWo73zQ-CqFtGCAVPqPU8Tnq0k';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
