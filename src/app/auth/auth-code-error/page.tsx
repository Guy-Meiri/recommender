'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthCodeErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            There was an issue with your authentication link
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div className="space-y-2">
            <p className="text-red-700 font-medium">Link expired or invalid</p>
            <p className="text-muted-foreground text-sm">
              The authentication link may have expired or been used already. Please try signing in again.
            </p>
          </div>
          <Button onClick={() => router.push('/')} className="w-full">
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
