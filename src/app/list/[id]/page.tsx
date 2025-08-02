'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Film, Tv, Calendar, Star, Share2, Users, Lock } from 'lucide-react';
import { List, ListItem } from '@/types';
import { supabaseStorage } from '@/lib/supabase-storage';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { tmdbApi } from '@/lib/tmdb';
import { SearchMoviesDialog } from '@/components/SearchMoviesDialog';
import { ShareListDialog } from '@/components/ShareListDialog';
import { Auth } from '@/components/Auth';
import { AppBar } from '@/components/AppBar';

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

  const handleListUpdated = (updatedList: List) => {
    setList(updatedList);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
    <>
      <AppBar user={user} onSignOut={handleSignOut} />
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 space-y-6">
          {/* Simplified Header - List name, back button, and share button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => router.push('/')} variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5 text-orange-500" />
              </Button>
              <h1 className="text-2xl font-bold">{list.name}</h1>
            </div>
            
            {/* Share Button - Only show for owners */}
            {list.isOwner === true && (
              <ShareListDialog list={list} onListUpdated={handleListUpdated}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-orange-500" />
                  Share
                </Button>
              </ShareListDialog>
            )}
          </div>

          {/* Add Item Button - Only show if user has write permission */}
          {(list.permission === 'write' || list.isOwner === true) && (
            <div className="flex justify-center">
              <SearchMoviesDialog 
                category={list.category}
                onItemAdded={handleAddItem}
              >
                <Button size="lg" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="h-5 w-5" />
                  Add Movies & TV Shows
                </Button>
              </SearchMoviesDialog>
            </div>
          )}

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
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
              {list.items.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="aspect-[2/3] bg-muted rounded-t-lg overflow-hidden">
                        {item.posterPath ? (
                          <Image
                            src={tmdbApi.getPosterUrl(item.posterPath)}
                            alt={item.title}
                            width={200}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {item.type === 'movie' ? (
                              <Film className="h-8 w-8 text-orange-500" />
                            ) : (
                              <Tv className="h-8 w-8 text-orange-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {/* Remove Button - Only show if user has write permission */}
                      {(list.permission === 'write' || list.isOwner === true) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {/* Rating Badge */}
                      {item.rating && item.rating > 0 && (
                        <div className="absolute top-1 left-1 bg-black/80 text-white px-1.5 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 fill-current text-yellow-400" />
                          {item.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2 space-y-1">
                      <h4 className="font-medium line-clamp-2 text-xs leading-tight">{item.title}</h4>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {item.type === 'movie' ? (
                            <Film className="h-2.5 w-2.5 text-orange-500" />
                          ) : (
                            <Tv className="h-2.5 w-2.5 text-orange-500" />
                          )}
                          <span className="text-xs">
                            {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Unknown'}
                          </span>
                        </div>
                        
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                          {item.type === 'movie' ? 'Movie' : 'TV'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Details Section - Moved to bottom */}
          <div className="border-t pt-6 mt-8 space-y-4">
            <h2 className="text-lg font-semibold">List Details</h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getCategoryIcon()}
                  {getCategoryLabel()}
                </Badge>
                
                {/* Sharing Status Badge */}
                {list.isOwner === false && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-orange-500" />
                    Shared with you
                    {list.permission === 'read' && <Lock className="h-3 w-3 text-orange-500" />}
                  </Badge>
                )}
                
                {list.isOwner === true && list.shares && list.shares.length > 0 && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-white" />
                    Shared with {list.shares.length}
                  </Badge>
                )}
              </div>
              
              {/* Owner info for shared lists */}
              {list.isOwner === false && (
                <p className="text-sm text-muted-foreground">
                  Created by another user • {list.permission === 'write' ? 'Can edit' : 'View only'}
                </p>
              )}
              
              {list.description && (
                <p className="text-muted-foreground">{list.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Created {list.createdAt.toLocaleDateString()}
                </div>
                <div>
                  {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
