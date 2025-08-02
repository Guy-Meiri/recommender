'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { CreateListDialog } from '@/components/CreateListDialog';
import { ListCard } from '@/components/ListCard';
import { Auth } from '@/components/Auth';
import { AppBar } from '@/components/AppBar';
import { useGetListsQuery, useDeleteListMutation } from '@/lib/api';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // RTK Query hooks - loading states are built-in
  const { data: lists = [], isLoading: listsLoading } = useGetListsQuery(undefined, {
    skip: !user, // Skip the query if user is not logged in
  });
  const [deleteList] = useDeleteListMutation();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleViewList = (listId: string) => {
    window.location.href = `/list/${listId}`;
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await deleteList(listId).unwrap();
        // RTK Query automatically updates the cache
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // The auth state listener will automatically update the user state
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthStateChange={setUser} />;
  }

  return (
    <>
      <AppBar user={user} onSignOut={handleSignOut} />
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Welcome to Batata Time
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Create and manage your personalized movie and TV show recommendation lists. 
              Share them with friends and discover new content together.
            </p>
          </div> */}

          <div className="flex justify-center">
            <CreateListDialog>
              <Button size="lg" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-5 w-5" />
                Create New List
              </Button>
            </CreateListDialog>
          </div>

          {lists.length === 0 && !listsLoading ? (
            <div className="text-center py-12">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-muted-foreground">
                  No lists yet
                </h3>
                <p className="text-muted-foreground">
                  Create your first watch list to get started!
                </p>
              </div>
            </div>
          ) : listsLoading ? (
            <div className="text-center py-12">
              <div className="space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                <p className="text-muted-foreground">Loading your lists...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  onViewList={handleViewList}
                  onDeleteList={handleDeleteList}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
