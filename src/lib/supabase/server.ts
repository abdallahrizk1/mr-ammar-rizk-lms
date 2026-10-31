import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  const defaultUrl = 'https://icgggnrrtkaoqsfbwqnf.supabase.co';
  const defaultKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljZ2dnbnJydGthb3FzZmJ3cW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNzE0MzIsImV4cCI6MjEwODk0NzQzMn0.H5hqKrAJGElV_b8ZAvFuKjwXgG7VHb7eEf2Y6wvI9xg';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultKey;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        apikey: supabaseAnonKey,
      },
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignored in Server Components
        }
      },
    },
  });
}
