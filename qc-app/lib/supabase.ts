import { createClient } from '@supabase/supabase-js';
import type { Job } from '../types';

// Your personal Supabase URL and Key are now configured here.
const supabaseUrl = 'https://qmnngahihnrbkiuvzfeh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbm5nYWhpaG5yYmtpdXZ6ZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjEwNjQsImV4cCI6MjA3Mzc5NzA2NH0.5W7CvwDtzzE9chzJehlUWT647ErYrDm8LKz43hM6QgQ';

// When deploying to a service like Vercel, you should use environment variables.
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
