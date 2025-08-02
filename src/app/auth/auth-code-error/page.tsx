'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Invalid confirmation link';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Confirmation</CardTitle>
          <CardDescription>
            There was an issue confirming your email
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div className="space-y-2">
            <p className="text-red-700 font-medium">Confirmation failed</p>
            <p className="text-muted-foreground text-sm">
              {error}
            </p>
            <p className="text-muted-foreground text-sm">
              The confirmation link may have expired or been used already. Please try signing up again.
            </p>
          </div>
          <Button onClick={() => router.push('/')} className="w-full">
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-muted-foreground mt-4">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
