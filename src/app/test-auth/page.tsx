'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{
    data?: unknown;
    error?: unknown;
    connection?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const redirectUrl = `${window.location.origin}/auth/confirm`;
      console.log('Testing signup with:', { email, redirectUrl });
      
      const response = await supabase.auth.signUp({
        email,
        password: 'test123456', // Test password
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      console.log('Signup response:', response);
      setResult(response);
      
    } catch (error) {
      console.error('Signup error:', error);
      setResult({ error });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Connection test:', { data, error });
      setResult({ connection: 'success', data, error });
    } catch (error) {
      console.error('Connection error:', error);
      setResult({ connection: 'failed', error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Auth Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label>Test Email:</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={loading}>
                Test Connection
              </Button>
              <Button onClick={testSignup} disabled={loading || !email}>
                Test Signup
              </Button>
            </div>
            
            {loading && <p>Loading...</p>}
            
            {result && (
              <div className="mt-4">
                <h3 className="font-bold">Result:</h3>
                <pre className="bg-muted p-4 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>📋 Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>✅ Check these in your Supabase dashboard:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Authentication → Settings → &quot;Enable email confirmations&quot; is ON</li>
                <li>Authentication → Email Templates → &quot;Confirm Signup&quot; is enabled</li>
                <li>Authentication → Providers → &quot;Email&quot; is enabled</li>
                <li>Authentication → URL Configuration → Site URL matches your domain</li>
                <li>Authentication → URL Configuration → Redirect URLs include your /auth/confirm</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
