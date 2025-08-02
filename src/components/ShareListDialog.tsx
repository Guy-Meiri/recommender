import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Share2, UserPlus, Trash2, Mail, Users } from 'lucide-react';
import { List, UserProfile } from '@/types';
import { supabaseStorage } from '@/lib/supabase-storage';

interface ShareListDialogProps {
  list: List;
  children: React.ReactNode;
}

export function ShareListDialog({ list, children }: ShareListDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'read' | 'write'>('write');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleSearchUsers = async (query: string) => {
    setEmail(query);
    if (query.length > 2) {
      setIsSearching(true);
      const results = await supabaseStorage.searchUsers(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleShare = async (targetEmail?: string) => {
    const emailToShare = targetEmail || email;
    if (!emailToShare) return;

    setIsSharing(true);
    const success = await supabaseStorage.shareList(list.id, emailToShare, permission);
    
    if (success) {
      // RTK Query will handle cache updates automatically
      setEmail('');
      setSearchResults([]);
    } else {
      alert('Failed to share list. Please check the email address and try again.');
    }
    setIsSharing(false);
  };

  const handleUnshare = async (userId: string) => {
    const success = await supabaseStorage.unshareList(list.id, userId);
    
    if (success) {
      // RTK Query will handle cache updates automatically
    } else {
      alert('Failed to remove sharing access.');
    }
  };

  // Only show sharing option for list owners
  if (list.isOwner !== true) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share &ldquo;{list.name}&rdquo;
          </DialogTitle>
          <DialogDescription>
            Share this list with other users. They will be able to view and edit the list.
          </DialogDescription>
        </DialogHeader>

        {/* Current Shares */}
        {list.shares && list.shares.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Users className="h-4 w-4" />
              Shared with
            </Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {list.shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {share.user_profile?.email || 'Unknown user'}
                    </span>
                    <Badge variant={share.permission === 'write' ? 'default' : 'secondary'} className="text-xs">
                      {share.permission}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUnshare(share.shared_with_user_id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Share */}
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-medium">
            Add person by email
          </Label>
          <div className="relative">
            <Input
              id="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => handleSearchUsers(e.target.value)}
              className="pr-24"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as 'read' | 'write')}
                className="text-xs bg-transparent border-none focus:outline-none"
              >
                <option value="write">Edit</option>
                <option value="read">View</option>
              </select>
            </div>
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="text-sm text-muted-foreground">Searching...</div>
          )}
          {searchResults.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleShare(user.email)}
                  disabled={isSharing}
                  className="w-full text-left p-2 hover:bg-muted rounded text-sm flex items-center gap-2"
                >
                  <Mail className="h-3 w-3" />
                  {user.email}
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => handleShare()}
            disabled={!email || isSharing}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
