import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { List } from '@/types';
import { Calendar, Film, Tv, Users, Lock, Trash2, Eye } from 'lucide-react';
import { tmdbApi } from '@/lib/tmdb';

interface ListCardProps {
  list: List;
  onViewList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
}

export function ListCard({ list, onViewList, onDeleteList }: ListCardProps) {
  const getCategoryIcon = () => {
    switch (list.category) {
      case 'movies':
        return <Film className="h-4 w-4 text-orange-500" />;
      case 'tv':
        return <Tv className="h-4 w-4 text-orange-500" />;
      default:
        return <><Film className="h-3 w-3 text-orange-500" /><Tv className="h-3 w-3 text-orange-500" /></>;
    }
  };

  const getCategoryLabel = () => {
    switch (list.category) {
      case 'movies':
        return 'Movies';
      case 'tv':
        return 'TV Shows';
      default:
        return 'Mixed';
    }
  };

  // Get a random backdrop from the list items for the card background
  const getRandomBackdrop = () => {
    const itemsWithBackdrops = list.items.filter(item => item.backdropPath);
    if (itemsWithBackdrops.length === 0) return null;
    const randomItem = itemsWithBackdrops[Math.floor(Math.random() * itemsWithBackdrops.length)];
    return tmdbApi.getBackdropUrl(randomItem.backdropPath);
  };

  const backdropUrl = getRandomBackdrop();

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer w-full max-w-sm group relative overflow-hidden">
      {/* Background Image Overlay */}
      {backdropUrl && (
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center transition-opacity duration-300 group-hover:opacity-50"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
      
      {/* Content - positioned relative to appear above overlays */}
      <div className="relative z-10">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg text-white drop-shadow-sm">{list.name}</CardTitle>
                {list.isOwner === false && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-black/20 backdrop-blur-sm">
                    <Users className="h-3 w-3 text-orange-400" />
                    Shared
                    {list.permission === 'read' && <Lock className="h-3 w-3 text-orange-400" />}
                  </Badge>
                )}
                {list.isOwner && list.shares && list.shares.length > 0 && (
                  <Badge variant="default" className="flex items-center gap-1 text-xs bg-orange-500/80 backdrop-blur-sm">
                    <Users className="h-3 w-3 text-white" />
                    {list.shares.length}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm line-clamp-2 min-h-[2.5rem] flex items-start text-gray-200 drop-shadow-sm">
                {list.description || '\u00A0'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 ml-2 bg-black/20 backdrop-blur-sm border-white/20">
              {getCategoryIcon()}
              <span className="hidden sm:inline text-white">{getCategoryLabel()}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 w-full">
              {/* Only show delete button for owned lists */}
              {list.isOwner === true && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 px-2 bg-black/20 backdrop-blur-sm border-white/20 hover:bg-black/40"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteList(list.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              )}
              <Button
                size="sm"
                className={`gap-1 bg-orange-500/90 hover:bg-orange-600/90 text-white backdrop-blur-sm ${list.isOwner === true ? "flex-1" : "w-full"}`}
                onClick={() => onViewList(list.id)}
              >
                <Eye className="h-3 w-3" />
                View List
              </Button>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-200 drop-shadow-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-orange-400" />
                <span>{new Date(list.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{list.items.length}</span>
                <span>{list.items.length === 1 ? 'item' : 'items'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
