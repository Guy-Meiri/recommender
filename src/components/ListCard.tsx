import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { List } from '@/types';
import { Calendar, Film, Tv } from 'lucide-react';

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
    <Card className="hover:shadow-md transition-shadow cursor-pointer w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{list.name}</CardTitle>
            {list.description && (
              <CardDescription className="text-sm">
                {list.description}
              </CardDescription>
            )}
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {getCategoryIcon()}
            {getCategoryLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteList(list.id);
              }}
            >
              Delete
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onViewList(list.id)}
            >
              View List
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {list.createdAt.toLocaleDateString()}
            </div>
            <div>
              {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
