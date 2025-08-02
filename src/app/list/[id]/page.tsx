'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Film, Tv, Calendar, Star } from 'lucide-react';
import { List, ListItem } from '@/types';
import { supabaseStorage } from '@/lib/supabase-storage';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { tmdbApi } from '@/lib/tmdb';
import { SearchMoviesDialog } from '@/components/SearchMoviesDialog';
import { Auth } from '@/components/Auth';

export default function ListPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [list, setList] = useState<List | null>(null);
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
    if (user && listId) {
      const loadListData = async () => {
        try {
          const foundList = await supabaseStorage.getList(listId);
          setList(foundList);
        } catch (error) {
          console.error('Error loading list:', error);
        }
      };
      loadListData();
    }
  }, [user, listId]);

  const handleAddItem = async (newItem: ListItem) => {
    if (!list) return;

    try {
      const success = await supabaseStorage.addItemToList(list.id, newItem);
      if (success) {
        // Reload the list to get updated data
        const updatedList = await supabaseStorage.getList(list.id);
        if (updatedList) {
          setList(updatedList);
        }
      } else {
        console.error('Failed to add item to list');
        alert('Failed to add item to list. Please try again.');
      }
    } catch (error) {
      console.error('Error adding item to list:', error);
      alert('An error occurred while adding the item. Please try again.');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!list) return;

    if (window.confirm('Remove this item from the list?')) {
      // Find the item to get its tmdbId
      const item = list.items.find(i => i.id === itemId);
      if (item) {
        const success = await supabaseStorage.removeItemFromList(list.id, item.tmdbId);
        if (success) {
          // Update local state
          setList({
            ...list,
            items: list.items.filter(item => item.id !== itemId)
          });
        }
      }
    }
  };

  const getCategoryIcon = () => {
    if (!list) return null;

    switch (list.category) {
      case 'movies':
        return <Film className="h-5 w-5" />;
      case 'tv':
        return <Tv className="h-5 w-5" />;
      default:
        return <><Film className="h-4 w-4" /><Tv className="h-4 w-4" /></>;
    }
  };

  const getCategoryLabel = () => {
    if (!list) return '';

    switch (list.category) {
      case 'movies':
        return 'Movies';
      case 'tv':
        return 'TV Shows';
      default:
        return 'Movies & TV Shows';
    }
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

  if (!list) {
    return (
      <div className="min-h-screen p-8 bg-background">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold text-muted-foreground">List not found</h1>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button onClick={() => router.push('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lists
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{list.name}</h1>
              <Badge variant="outline" className="flex items-center gap-1">
                {getCategoryIcon()}
                {getCategoryLabel()}
              </Badge>
            </div>
            
            {list.description && (
              <p className="text-muted-foreground text-lg">{list.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {list.createdAt.toLocaleDateString()}
              </div>
              <div>
                {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>
        </div>

        {/* Add Item Button */}
        <div className="flex justify-center">
          <SearchMoviesDialog 
            category={list.category}
            onItemAdded={handleAddItem}
          >
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add Movies & TV Shows
            </Button>
          </SearchMoviesDialog>
        </div>

        {/* Items Grid */}
        {list.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-muted-foreground">
                No items yet
              </h3>
              <p className="text-muted-foreground">
                Start building your list by adding some movies and TV shows!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.items.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="aspect-[2/3] bg-muted rounded-t-lg overflow-hidden">
                      {item.posterPath ? (
                        <Image
                          src={tmdbApi.getPosterUrl(item.posterPath)}
                          alt={item.title}
                          width={300}
                          height={450}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.type === 'movie' ? (
                            <Film className="h-12 w-12 text-muted-foreground" />
                          ) : (
                            <Tv className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="p-4 space-y-2">
                    <h4 className="font-semibold line-clamp-2 text-sm">{item.title}</h4>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {item.type === 'movie' ? (
                          <Film className="h-3 w-3" />
                        ) : (
                          <Tv className="h-3 w-3" />
                        )}
                        {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Unknown'}
                      </div>
                      
                      {item.rating && item.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          {item.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
