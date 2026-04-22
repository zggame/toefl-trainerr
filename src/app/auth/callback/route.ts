import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/toefl';

  if (code) {
    const sessionCookies: Array<{
      name: string;
      value: string;
      options: CookieOptions;
    }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach((cookie) => sessionCookies.push(cookie));
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      sessionCookies.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)
      );
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth`);
}
