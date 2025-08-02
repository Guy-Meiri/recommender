import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { List } from '@/types';
import { Calendar, Film, Tv, Users, Lock } from 'lucide-react';

interface ListCardProps {
  list: List;
  onViewList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
}

export function ListCard({ list, onViewList, onDeleteList }: ListCardProps) {
  const getCategoryIcon = () => {
    switch (list.category) {
      case 'movies':
        return <Film className="h-4 w-4" />;
      case 'tv':
        return <Tv className="h-4 w-4" />;
      default:
        return <><Film className="h-3 w-3" /><Tv className="h-3 w-3" /></>;
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

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer w-full max-w-sm group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{list.name}</CardTitle>
              {!list.isOwner && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  Shared
                  {list.permission === 'read' && <Lock className="h-3 w-3" />}
                </Badge>
              )}
              {list.isOwner && list.shares && list.shares.length > 0 && (
                <Badge variant="default" className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  {list.shares.length}
                </Badge>
              )}
            </div>
            {list.description && (
              <CardDescription className="text-sm line-clamp-2">
                {list.description}
              </CardDescription>
            )}
          </div>
          <Badge variant="outline" className="flex items-center gap-1 ml-2">
            {getCategoryIcon()}
            <span className="hidden sm:inline">{getCategoryLabel()}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 w-full">
            {/* Only show delete button for owned lists */}
            {list.isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteList(list.id);
                }}
              >
                Delete
              </Button>
            )}
            <Button
              size="sm"
              className={list.isOwner ? "flex-1" : "w-full"}
              onClick={() => onViewList(list.id)}
            >
              View List
            </Button>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{list.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{list.items.length}</span>
              <span>{list.items.length === 1 ? 'item' : 'items'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
