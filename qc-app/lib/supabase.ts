
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const errorMessage = `
    Supabase URL and Key are not configured. 
    Please set SUPABASE_URL and SUPABASE_ANON_KEY as environment variables in your Vercel project settings.
    
    1. Go to your project on Vercel.
    2. Go to Settings > Environment Variables.
    3. Add the keys and their corresponding values.
    4. Redeploy the application.
  `;
  // We'll render this error to the screen to make it obvious.
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 2rem; font-family: sans-serif; background-color: #fff1f2; color: #991b1b; height: 100vh; display: flex; align-items: center; justify-content: center;">
      <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 1rem; line-height: 1.5;">${errorMessage.trim()}</pre>
    </div>`;
  }
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
