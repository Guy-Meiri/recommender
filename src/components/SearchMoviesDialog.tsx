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
import { Search, Plus, Film, Tv } from 'lucide-react';
import { TMDBSearchResult, ListItem } from '@/types';
import { tmdbApi } from '@/lib/tmdb';

interface SearchMoviesDialogProps {
  onAddItem: (item: ListItem) => void;
  children: React.ReactNode;
}

export function SearchMoviesDialog({ onAddItem, children }: SearchMoviesDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await tmdbApi.search(query.trim());
      setResults(response.results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = (tmdbItem: TMDBSearchResult) => {
    const listItem: ListItem = {
      id: crypto.randomUUID(),
      tmdbId: tmdbItem.id,
      type: tmdbItem.media_type,
      title: tmdbItem.title || tmdbItem.name || 'Unknown Title',
      posterPath: tmdbItem.poster_path,
      releaseDate: tmdbItem.release_date || tmdbItem.first_air_date,
      rating: tmdbItem.vote_average,
      genre: [], // We'll populate this later if needed
      addedAt: new Date()
    };

    onAddItem(listItem);
    setOpen(false);
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Movies & TV Shows</DialogTitle>
          <DialogDescription>
            Search for movies and TV shows to add to your list.
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
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isSearching && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          )}

          {hasSearched && !isSearching && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found. Try a different search term.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3 py-4">
              {results.map((item) => (
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
                            <Button size="sm" onClick={() => handleAddItem(item)}>
                              <Plus className="h-4 w-4" />
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
