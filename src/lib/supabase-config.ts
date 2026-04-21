const MOCK_SUPABASE_URL = 'https://mock.supabase.co';
const MOCK_SUPABASE_KEY = 'mock-key';

export interface SupabaseServerConfig {
  mode: 'live' | 'mock';
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface SupabaseBrowserConfig {
  mode: 'live' | 'mock';
  url: string;
  anonKey: string;
}

export function getSupabaseBrowserConfig(
  env: NodeJS.ProcessEnv = process.env
): SupabaseBrowserConfig {
  if (env.SUPABASE_USE_MOCK === 'true') {
    return { mode: 'mock', url: MOCK_SUPABASE_URL, anonKey: MOCK_SUPABASE_KEY };
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.warn('[supabase-config] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — using mock mode');
    return { mode: 'mock', url: MOCK_SUPABASE_URL, anonKey: MOCK_SUPABASE_KEY };
  }
  return { mode: 'live', url, anonKey };
}

export function getSupabaseServerConfig(
  env: NodeJS.ProcessEnv = process.env
): SupabaseServerConfig {
  if (env.SUPABASE_USE_MOCK === 'true') {
    return { mode: 'mock', url: MOCK_SUPABASE_URL, anonKey: MOCK_SUPABASE_KEY, serviceRoleKey: MOCK_SUPABASE_KEY };
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceRoleKey) {
    console.warn('[supabase-config] Missing SUPABASE_SERVICE_ROLE_KEY — using mock mode');
    return { mode: 'mock', url: url || MOCK_SUPABASE_URL, anonKey: anonKey || MOCK_SUPABASE_KEY, serviceRoleKey: MOCK_SUPABASE_KEY };
  }
  return { mode: 'live', url, anonKey, serviceRoleKey };
}