import { supabase } from './supabase';
import { List, ListItem, UserProfile } from '@/types';
import { Database } from '../types/database';

type ListRow = Database['public']['Tables']['lists']['Row'];
type ListInsert = Database['public']['Tables']['lists']['Insert'];
type ListItemRow = Database['public']['Tables']['list_items']['Row'];
type ListItemInsert = Database['public']['Tables']['list_items']['Insert'];
type ListShareRow = Database['public']['Tables']['list_shares']['Row'];
type ListShareInsert = Database['public']['Tables']['list_shares']['Insert'];
type UserProfileRow = Database['public']['Views']['user_profiles']['Row'];

// Helper function to convert database row to List type
function convertDbListToList(dbList: ListRow & { 
  list_items?: ListItemRow[]; 
  list_shares?: (ListShareRow & { user_profiles?: UserProfileRow })[]; 
  user_permission?: 'read' | 'write';
  is_owner?: boolean;
}, items: ListItem[] = [], currentUserId?: string): List {
  const shares = dbList.list_shares?.map(share => ({
    id: share.id,
    list_id: share.list_id,
    shared_with_user_id: share.shared_with_user_id,
    shared_by_user_id: share.shared_by_user_id,
    permission: share.permission,
    created_at: share.created_at,
    user_profile: share.user_profiles ? {
      id: share.user_profiles.id,
      email: share.user_profiles.email,
      created_at: share.user_profiles.created_at
    } : undefined
  })) || [];

  const isOwner = currentUserId ? dbList.user_id === currentUserId : false;
  const permission = dbList.user_permission || (isOwner ? 'write' : 'read');

  return {
    id: dbList.id,
    name: dbList.name,
    description: dbList.description || undefined,
    category: dbList.category,
    createdAt: new Date(dbList.created_at),
    updatedAt: new Date(dbList.created_at), // Using created_at for now, we can add updated_at later
    items,
    user_id: dbList.user_id,
    isOwner,
    permission,
    shares
  };
}

// Helper function to convert database row to ListItem type
function convertDbItemToListItem(dbItem: ListItemRow): ListItem {
  return {
    id: dbItem.id, // Use the UUID as the id
    tmdbId: dbItem.tmdb_id,
    type: dbItem.media_type,
    title: dbItem.title,
    posterPath: dbItem.poster_path || undefined,
    addedAt: new Date(dbItem.added_at),
    rating: dbItem.rating || undefined,
    releaseDate: dbItem.release_date || undefined,
    genre: dbItem.genre || []
  };
}

export const supabaseStorage = {
  // Get all lists for the current user (owned and shared)
  async getLists(): Promise<List[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get owned lists
    const { data: ownedLists, error: ownedError } = await supabase
      .from('lists')
      .select(`
        *,
        list_items (
          id,
          tmdb_id,
          title,
          media_type,
          poster_path,
          added_at,
          rating,
          release_date,
          genre
        ),
        list_shares (
          id,
          shared_with_user_id,
          shared_by_user_id,
          permission,
          created_at,
          user_profiles!list_shares_shared_with_user_id_fkey (
            id,
            email,
            created_at
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Get shared lists
    const { data: sharedLists, error: sharedError } = await supabase
      .from('lists')
      .select(`
        *,
        list_items (
          id,
          tmdb_id,
          title,
          media_type,
          poster_path,
          added_at,
          rating,
          release_date,
          genre
        ),
        list_shares!inner (
          id,
          shared_with_user_id,
          shared_by_user_id,
          permission,
          created_at
        )
      `)
      .eq('list_shares.shared_with_user_id', user.id)
      .order('created_at', { ascending: false });

    if (ownedError) {
      console.error('Error fetching owned lists:', ownedError);
    }
    if (sharedError) {
      console.error('Error fetching shared lists:', sharedError);
    }

    const allLists = [];

    // Process owned lists
    if (ownedLists) {
      allLists.push(...ownedLists.map(list => {
        const items = list.list_items.map(convertDbItemToListItem);
        return convertDbListToList({ ...list, is_owner: true, user_permission: 'write' }, items, user.id);
      }));
    }

    // Process shared lists
    if (sharedLists) {
      allLists.push(...sharedLists.map(list => {
        const items = list.list_items.map(convertDbItemToListItem);
        const userShare = list.list_shares.find((share: ListShareRow) => share.shared_with_user_id === user.id);
        return convertDbListToList({ 
          ...list, 
          is_owner: false, 
          user_permission: userShare?.permission || 'read' 
        }, items, user.id);
      }));
    }

    return allLists;
  },

  // Get a specific list by ID (owned or shared)
  async getList(listId: string): Promise<List | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: list, error } = await supabase
      .from('lists')
      .select(`
        *,
        list_items (
          id,
          tmdb_id,
          title,
          media_type,
          poster_path,
          added_at,
          rating,
          release_date,
          genre
        ),
        list_shares (
          id,
          shared_with_user_id,
          shared_by_user_id,
          permission,
          created_at
        )
      `)
      .eq('id', listId)
      .single();

    if (error) {
      console.error('Error fetching list:', error);
      return null;
    }

    const items = list.list_items.map(convertDbItemToListItem);
    const isOwner = list.user_id === user.id;
    const userShare = list.list_shares.find((share: ListShareRow) => share.shared_with_user_id === user.id);
    const permission = isOwner ? 'write' : (userShare?.permission || 'read');

    // Check if user has access to this list
    if (!isOwner && !userShare) {
      return null; // User doesn't have access
    }

    // Fetch emails for shared users if user is owner
    let sharesWithEmails = list.list_shares;
    if (isOwner && list.list_shares.length > 0) {
      sharesWithEmails = await Promise.all(
        list.list_shares.map(async (share: ListShareRow) => {
          const { data: email } = await supabase.rpc('get_user_email', {
            user_id: share.shared_with_user_id
          });
          return {
            ...share,
            user_profile: email ? {
              id: share.shared_with_user_id,
              email: email,
              created_at: share.created_at
            } : undefined
          };
        })
      );
    }

    return convertDbListToList({ 
      ...list, 
      list_shares: sharesWithEmails,
      is_owner: isOwner, 
      user_permission: permission 
    }, items, user.id);
  },

  // Add a new list
  async addList(listData: Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'items' | 'user_id' | 'isOwner' | 'permission' | 'shares'>): Promise<List | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const insertData: ListInsert = {
      user_id: user.id,
      name: listData.name,
      description: listData.description || null,
      category: listData.category
    };

    const { data: list, error } = await supabase
      .from('lists')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating list:', error);
      return null;
    }

    return convertDbListToList({ ...list, is_owner: true, user_permission: 'write' }, [], user.id);
  },

  // Update a list
  async updateList(listId: string, updates: Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'items' | 'user_id' | 'isOwner' | 'permission' | 'shares'>>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user has write permission
    const list = await this.getList(listId);
    if (!list || (list.permission !== 'write' && !list.isOwner)) {
      return false;
    }

    const { error } = await supabase
      .from('lists')
      .update({
        name: updates.name,
        description: updates.description || null,
        category: updates.category
      })
      .eq('id', listId);

    if (error) {
      console.error('Error updating list:', error);
      return false;
    }

    return true;
  },

  // Delete a list (only owner can delete)
  async deleteList(listId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting list:', error);
      return false;
    }

    return true;
  },

  // Add an item to a list
  async addItemToList(listId: string, item: ListItem): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user has write permission
    const list = await this.getList(listId);
    if (!list || (list.permission !== 'write' && !list.isOwner)) {
      return false;
    }

    const insertData: ListItemInsert = {
      list_id: listId,
      tmdb_id: item.tmdbId,
      title: item.title,
      media_type: item.type,
      poster_path: item.posterPath || null,
      rating: item.rating || null,
      release_date: item.releaseDate || null,
      genre: item.genre || null
    };

    const { error } = await supabase
      .from('list_items')
      .insert(insertData);

    if (error) {
      console.error('Error adding item to list:', error);
      return false;
    }

    return true;
  },

  // Remove an item from a list
  async removeItemFromList(listId: string, tmdbId: number): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user has write permission
    const list = await this.getList(listId);
    if (!list || (list.permission !== 'write' && !list.isOwner)) {
      return false;
    }

    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('list_id', listId)
      .eq('tmdb_id', tmdbId);

    if (error) {
      console.error('Error removing item from list:', error);
      return false;
    }

    return true;
  },

  // Share a list with a user by email
  async shareList(listId: string, email: string, permission: 'read' | 'write' = 'write'): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if current user owns the list
    const list = await this.getList(listId);
    if (!list || !list.isOwner) {
      return false;
    }

    // Find the user by email using the function
    const { data: users, error: userError } = await supabase.rpc('search_users_by_email', {
      email_query: email
    });

    if (userError || !users || users.length === 0) {
      console.error('User not found:', userError);
      return false;
    }

    // Find exact email match
    const targetUser = users.find((u: { id: string; email: string; created_at: string }) => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    if (!targetUser) {
      console.error('Exact email match not found');
      return false;
    }

    // Don't allow sharing with yourself
    if (targetUser.id === user.id) {
      return false;
    }

    const insertData: ListShareInsert = {
      list_id: listId,
      shared_with_user_id: targetUser.id,
      shared_by_user_id: user.id,
      permission
    };

    const { error } = await supabase
      .from('list_shares')
      .upsert(insertData, {
        onConflict: 'list_id,shared_with_user_id'
      });

    if (error) {
      console.error('Error sharing list:', error);
      return false;
    }

    return true;
  },

  // Remove sharing for a list
  async unshareList(listId: string, userId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if current user owns the list
    const list = await this.getList(listId);
    if (!list || !list.isOwner) {
      return false;
    }

    const { error } = await supabase
      .from('list_shares')
      .delete()
      .eq('list_id', listId)
      .eq('shared_with_user_id', userId);

    if (error) {
      console.error('Error unsharing list:', error);
      return false;
    }

    return true;
  },

  // Search users by email (for sharing)
  async searchUsers(emailQuery: string): Promise<UserProfile[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: users, error } = await supabase.rpc('search_users_by_email', {
      email_query: emailQuery
    });

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return users || [];
  }
};
