'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { List } from '@/types';
import { supabaseStorage } from '@/lib/supabase-storage';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { CreateListDialog } from '@/components/CreateListDialog';
import { ListCard } from '@/components/ListCard';
import { Auth } from '@/components/Auth';
import { AppBar } from '@/components/AppBar';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  useEffect(() => {
    // Load lists when user changes
    if (user) {
      loadLists();
    } else {
      setLists([]);
    }
  }, [user]);

  const loadLists = async () => {
    try {
      const storedLists = await supabaseStorage.getLists();
      setLists(storedLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const handleListCreated = (newList: List) => {
    setLists(prev => [newList, ...prev]);
  };

  const handleViewList = (listId: string) => {
    window.location.href = `/list/${listId}`;
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      const success = await supabaseStorage.deleteList(listId);
      if (success) {
        setLists(prev => prev.filter(list => list.id !== listId));
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
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
            <CreateListDialog onListCreated={handleListCreated}>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create New List
              </Button>
            </CreateListDialog>
          </div>

          {lists.length === 0 ? (
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
