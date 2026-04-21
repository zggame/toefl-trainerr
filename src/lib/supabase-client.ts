import 'server-only';
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
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

export function getAuthCallbackUrl(path = '/auth/callback') {
  if (typeof window === 'undefined') {
    throw new Error('Auth callback URL requires a browser environment');
  }
  return new URL(path, window.location.origin).toString();
}