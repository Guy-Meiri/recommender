'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Film, Tv, Loader2 } from 'lucide-react';
import { TMDBSearchResult, ListItem } from '@/types';
import { tmdbApi } from '@/lib/tmdb';

interface SearchMoviesDialogProps {
  category: 'movies' | 'tv' | 'both';
  onItemAdded: (item: ListItem) => void;
  children: React.ReactNode;
}

export function SearchMoviesDialog({ category, onItemAdded, children }: SearchMoviesDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      console.log('Starting search for:', query.trim());
      const response = await tmdbApi.search(query.trim());
      console.log('Search response:', response);
      setResults(response.results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search. Please try again.');
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = async (tmdbItem: TMDBSearchResult) => {
    // Filter based on category
    if (category === 'movies' && tmdbItem.media_type !== 'movie') return;
    if (category === 'tv' && tmdbItem.media_type !== 'tv') return;

    const itemId = tmdbItem.id.toString();
    setAddingItems(prev => new Set(prev).add(itemId));

    try {
      const listItem: ListItem = {
        id: crypto.randomUUID(),
        tmdbId: tmdbItem.id,
        type: tmdbItem.media_type,
        title: tmdbItem.title || tmdbItem.name || 'Unknown Title',
        posterPath: tmdbItem.poster_path,
        backdropPath: tmdbItem.backdrop_path,
        releaseDate: tmdbItem.release_date || tmdbItem.first_air_date,
        rating: tmdbItem.vote_average,
        genre: [], // We'll populate this later if needed
        addedAt: new Date().toISOString() // Convert to ISO string
      };

      // Let the parent component handle adding to Supabase
      await onItemAdded(listItem);
      setOpen(false);
      setQuery('');
      setResults([]);
      setHasSearched(false);
      setError(null);
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item. Please try again.');
    } finally {
      setAddingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset state when opening
      setQuery('');
      setResults([]);
      setHasSearched(false);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add {category === 'movies' ? 'Movies' : category === 'tv' ? 'TV Shows' : 'Movies & TV Shows'}</DialogTitle>
          <DialogDescription>
            Search for {category === 'movies' ? 'movies' : category === 'tv' ? 'TV shows' : 'movies and TV shows'} to add to your list.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2">
          <Input
            placeholder="Search for movies or TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
          />
          <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto" />
                <p className="text-muted-foreground">Searching...</p>
              </div>
            </div>
          )}

          {hasSearched && !isSearching && results.length === 0 && !error && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found. Try a different search term.</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <p className="text-muted-foreground text-sm mt-2">Check the browser console for more details.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3 py-4">
              {results
                .filter(item => {
                  if (category === 'movies') return item.media_type === 'movie';
                  if (category === 'tv') return item.media_type === 'tv';
                  return true; // 'both' shows all
                })
                .map((item) => (
                <Card key={`${item.media_type}-${item.id}`} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-24 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                        {item.poster_path ? (
                          <Image
                            src={tmdbApi.getPosterUrl(item.poster_path)}
                            alt={item.title || item.name || 'Movie poster'}
                            width={64}
                            height={96}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="text-muted-foreground">
                            {item.media_type === 'movie' ? <Film className="h-6 w-6" /> : <Tv className="h-6 w-6" />}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{item.title || item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.release_date || item.first_air_date ? 
                                new Date(item.release_date || item.first_air_date!).getFullYear() : 
                                'Year unknown'
                              }
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {item.media_type === 'movie' ? (
                                <><Film className="h-3 w-3 mr-1" />Movie</>
                              ) : (
                                <><Tv className="h-3 w-3 mr-1" />TV Show</>
                              )}
                            </Badge>
                            <Button 
                              size="sm" 
                              onClick={() => handleAddItem(item)}
                              disabled={addingItems.has(item.id.toString())}
                            >
                              {addingItems.has(item.id.toString()) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {item.vote_average && item.vote_average > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">Rating:</span>
                            <span className="text-sm font-medium">{item.vote_average.toFixed(1)}/10</span>
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
      </DialogContent>
    </Dialog>
  );
}
