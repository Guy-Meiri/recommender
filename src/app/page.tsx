'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { List } from '@/types';
import { storage } from '@/lib/storage';
import { CreateListDialog } from '@/components/CreateListDialog';
import { ListCard } from '@/components/ListCard';

export default function Home() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLists = () => {
      try {
        const storedLists = storage.getLists();
        setLists(storedLists);
      } catch (error) {
        console.error('Error loading lists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, []);

  const handleListCreated = (newList: List) => {
    setLists(prev => [newList, ...prev]);
  };

  const handleViewList = (listId: string) => {
    window.location.href = `/list/${listId}`;
  };

  const handleDeleteList = (listId: string) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      const success = storage.deleteList(listId);
      if (success) {
        setLists(prev => prev.filter(list => list.id !== listId));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <main className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Batata Time
          </h1>
          <p className="text-muted-foreground text-lg">
            Create and manage your personalized movie and TV show recommendation lists
          </p>
        </div>

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
                Create your first recommendation list to get started!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
  );
}
