import { createBrowserClient } from '@supabase/ssr';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const defaultUrl = 'https://icgggnrrtkaoqsfbwqnf.supabase.co';
  const defaultKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljZ2dnbnJydGthb3FzZmJ3cW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNzE0MzIsImV4cCI6MjEwODk0NzQzMn0.H5hqKrAJGElV_b8ZAvFuKjwXgG7VHb7eEf2Y6wvI9xg';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! || defaultUrl;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || defaultKey;

  if (typeof window !== 'undefined' && clientInstance) {
    return clientInstance;
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        apikey: supabaseAnonKey,
      },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (!headers.has('apikey')) {
          headers.set('apikey', supabaseAnonKey);
        }
        return fetch(input, { ...init, headers });
      },
    },
  });

  if (typeof window !== 'undefined') {
    clientInstance = client;
  }

  return client;
}
