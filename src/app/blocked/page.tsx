
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/glowing-card';
import { Ban } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function BlockedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
        router.push('/sign-in');
    }
  }, [user, loading, router]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/30">
        <GlowingCard className="w-full max-w-md" glowColor="primary">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive text-destructive-foreground rounded-full h-12 w-12 flex items-center justify-center mb-4 border shadow-inner">
              <Ban className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl text-destructive">Account Blocked</CardTitle>
            <CardDescription>Your account has been blocked by an administrator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center min-h-[6rem] flex flex-col items-center justify-center">
            <p className='text-sm text-muted-foreground'>Please contact support for more information. You will not be able to access the dashboard or other services.</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
             <Button variant="destructive" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </CardFooter>
        </GlowingCard>
    </div>
  );
}
