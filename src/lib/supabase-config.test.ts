import { describe, expect, test } from 'vitest';
import { getSupabaseBrowserConfig } from './supabase-config';

describe('getSupabaseBrowserConfig', () => {
  test('throws when public Supabase env vars are missing', () => {
    expect(() => getSupabaseBrowserConfig({})).toThrow(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
    );
  });
});
