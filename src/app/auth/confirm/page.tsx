'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmUser = async () => {
      try {
        // Handle both old-style token confirmation and new-style code confirmation
        const token = searchParams.get('token');
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const code = searchParams.get('code');

        console.log('🔐 Confirmation attempt:', { token, tokenHash, type, code });

        // If we have a code parameter, redirect to the callback route
        if (code) {
          console.log('🔄 Redirecting to callback route for code-based confirmation');
          const callbackUrl = `/auth/callback?code=${code}`;
          router.replace(callbackUrl);
          return;
        }

        // Handle old-style token confirmation
        if (token && type === 'signup') {
          console.log('🔐 Using legacy token confirmation');
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) throw error;
        } 
        // Handle token hash confirmation
        else if (tokenHash && type === 'signup') {
          console.log('🔐 Using token hash confirmation');
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'signup'
          });

          if (error) throw error;
        } 
        // Handle URL fragment (old-style links)
        else if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('🔐 Using hash-based tokens');
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) throw error;
          } else {
            throw new Error('No valid confirmation parameters found');
          }
        } else {
          throw new Error('Invalid confirmation link - no valid parameters found');
        }

        setConfirmed(true);
        console.log('✅ Email confirmation successful');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (err) {
        console.error('❌ Confirmation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to confirm email');
      } finally {
        setLoading(false);
      }
    };

    confirmUser();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Confirmation</CardTitle>
          <CardDescription>
            {loading && 'Confirming your email address...'}
            {confirmed && 'Your email has been confirmed!'}
            {error && 'There was an issue confirming your email'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {loading && (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
              <p className="text-muted-foreground">Please wait while we confirm your email...</p>
            </div>
          )}

          {confirmed && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-green-700 font-medium">Email confirmed successfully!</p>
                <p className="text-muted-foreground text-sm">
                  You will be redirected to the app shortly...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-red-700 font-medium">Confirmation failed</p>
                <p className="text-muted-foreground text-sm">{error}</p>
              </div>
              <Button onClick={() => router.push('/')} variant="outline">
                Go to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
            <p className="text-muted-foreground mt-4">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
