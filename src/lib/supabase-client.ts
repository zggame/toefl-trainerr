import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { getSupabaseBrowserConfig, getSupabaseServerConfig } from './supabase-config';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (!browserClient) {
    const config = getSupabaseBrowserConfig();
    browserClient = createBrowserClient(config.url, config.anonKey);
  }
  return browserClient;
}

export function getSupabaseServer() {
  const config = getSupabaseServerConfig();
  return createClient(config.url, config.serviceRoleKey);
}

export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  const config = getSupabaseBrowserConfig();
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // API routes only need to read the existing browser session.
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function getAuthCallbackUrl(path = '/auth/callback') {
  if (typeof window === 'undefined') {
    throw new Error('Auth callback URL requires a browser environment');
  }
  return new URL(path, window.location.origin).toString();
}
