import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    try {
      // Create a one-time Supabase client for this request
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        // Successful authentication - redirect to the intended page
        console.log('✅ Email confirmation successful');
        const redirectUrl = new URL(next, request.url);
        return NextResponse.redirect(redirectUrl);
      } else {
        console.error('❌ Code exchange error:', error);
        // Return user to error page with the specific error
        const errorUrl = new URL('/auth/auth-code-error', request.url);
        errorUrl.searchParams.set('error', error.message);
        return NextResponse.redirect(errorUrl);
      }
    } catch (error) {
      console.error('❌ Auth callback error:', error);
      const errorUrl = new URL('/auth/auth-code-error', request.url);
      errorUrl.searchParams.set('error', 'Authentication failed');
      return NextResponse.redirect(errorUrl);
    }
  }

  // No code provided - redirect to error page
  console.error('❌ No confirmation code provided');
  const errorUrl = new URL('/auth/auth-code-error', request.url);
  errorUrl.searchParams.set('error', 'Invalid confirmation link');
  return NextResponse.redirect(errorUrl);
}
