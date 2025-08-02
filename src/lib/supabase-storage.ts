import { supabase } from './supabase';
import { List, ListItem } from '@/types';
import { Database } from '../types/database';

type ListRow = Database['public']['Tables']['lists']['Row'];
type ListInsert = Database['public']['Tables']['lists']['Insert'];
type ListItemRow = Database['public']['Tables']['list_items']['Row'];
type ListItemInsert = Database['public']['Tables']['list_items']['Insert'];

// Helper function to convert database row to List type
function convertDbListToList(dbList: ListRow, items: ListItem[] = []): List {
  return {
    id: dbList.id,
    name: dbList.name,
    description: dbList.description || undefined,
    category: dbList.category,
    createdAt: new Date(dbList.created_at),
    updatedAt: new Date(dbList.created_at), // Using created_at for now, we can add updated_at later
    items
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
    addedAt: new Date(dbItem.added_at)
  };
}

export const supabaseStorage = {
  // Get all lists for the current user
  async getLists(): Promise<List[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: lists, error } = await supabase
      .from('lists')
      .select(`
        *,
        list_items (
          id,
          tmdb_id,
          title,
          media_type,
          poster_path,
          added_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lists:', error);
      return [];
    }

    return lists.map(list => {
      const items = list.list_items.map(convertDbItemToListItem);
      return convertDbListToList(list, items);
    });
  },

  // Get a specific list by ID
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
          added_at
        )
      `)
      .eq('id', listId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching list:', error);
      return null;
    }

    const items = list.list_items.map(convertDbItemToListItem);
    return convertDbListToList(list, items);
  },

  // Add a new list
  async addList(listData: Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'items'>): Promise<List | null> {
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

    return convertDbListToList(list);
  },

  // Update a list
  async updateList(listId: string, updates: Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'items'>>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('lists')
      .update({
        name: updates.name,
        description: updates.description || null,
        category: updates.category
      })
      .eq('id', listId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating list:', error);
      return false;
    }

    return true;
  },

  // Delete a list
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

    // First verify the list belongs to the user
    const { data: list } = await supabase
      .from('lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single();

    if (!list) return false;

    const insertData: ListItemInsert = {
      list_id: listId,
      tmdb_id: item.tmdbId,
      title: item.title,
      media_type: item.type,
      poster_path: item.posterPath || null
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

    // First verify the list belongs to the user
    const { data: list } = await supabase
      .from('lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single();

    if (!list) return false;

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
  }
};
