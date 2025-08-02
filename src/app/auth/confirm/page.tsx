'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmUser = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'signup') {
          throw new Error('Invalid confirmation link');
        }

        // Verify the token with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          throw error;
        }

        setConfirmed(true);
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (err) {
        console.error('Confirmation error:', err);
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
