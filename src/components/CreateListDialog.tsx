'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCreateListMutation } from '@/lib/api';

interface CreateListDialogProps {
  children: React.ReactNode;
}

export function CreateListDialog({ children }: CreateListDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'movies' | 'tv' | 'both'>('both');
  
  const [createList, { isLoading: isCreating }] = useCreateListMutation();

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      await createList({
        name: name.trim(),
        description: description.trim() || undefined,
        category
      }).unwrap();
      
      // Reset form and close dialog - RTK Query handles cache updates automatically
      setOpen(false);
      setName('');
      setDescription('');
      setCategory('both');
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const categories = [
    { value: 'both', label: 'Movies & TV Shows' },
    { value: 'movies', label: 'Movies Only' },
    { value: 'tv', label: 'TV Shows Only' }
  ] as const;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Create a new recommendation list for movies and TV shows.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekend Movie Marathon"
              disabled={isCreating}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this list about?"
              disabled={isCreating}
            />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={category === cat.value ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => !isCreating && setCategory(cat.value)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create List'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
