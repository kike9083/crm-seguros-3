
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anxslrwnakeltnlngcab.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueHNscnduYWtlbHRubG5nY2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDgwNTYsImV4cCI6MjA3ODQ4NDA1Nn0.Gqy_xRyzS7vPheDwhBO8XFeXm7uUz0BDqWt03UCJxjQ';

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL o clave anónima no están definidas. Asegúrate de que estén configuradas.");
}

// FIX: Explicitly specify the database schema and auth options in the client options.
// This helps prevent schema resolution issues and ensures session management is robust,
// which is critical for RLS policies to work correctly.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
