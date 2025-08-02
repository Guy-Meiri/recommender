import { List, ListItem } from '@/types';

const LISTS_STORAGE_KEY = 'movie-tv-lists';

interface StoredList extends Omit<List, 'createdAt' | 'updatedAt' | 'items'> {
  createdAt: string;
  updatedAt: string;
  items: Array<Omit<ListItem, 'addedAt'> & { addedAt: string }>;
}

export const storage = {
  // Get all lists from localStorage
  getLists: (): List[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(LISTS_STORAGE_KEY);
      if (!stored) return [];
      
      const lists: StoredList[] = JSON.parse(stored);
      // Convert date strings back to Date objects
      return lists.map((list) => ({
        ...list,
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt),
        items: list.items.map((item) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }))
      }));
    } catch (error) {
      console.error('Error loading lists from storage:', error);
      return [];
    }
  },

  // Save all lists to localStorage
  saveLists: (lists: List[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving lists to storage:', error);
    }
  },

  // Add a new list
  addList: (list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): List => {
    const newList: List = {
      ...list,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      items: []
    };

    const lists = storage.getLists();
    lists.push(newList);
    storage.saveLists(lists);
    
    return newList;
  },

  // Update an existing list
  updateList: (listId: string, updates: Partial<List>): List | null => {
    const lists = storage.getLists();
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) return null;
    
    lists[listIndex] = {
      ...lists[listIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    storage.saveLists(lists);
    return lists[listIndex];
  },

  // Delete a list
  deleteList: (listId: string): boolean => {
    const lists = storage.getLists();
    const filteredLists = lists.filter(list => list.id !== listId);
    
    if (filteredLists.length === lists.length) return false;
    
    storage.saveLists(filteredLists);
    return true;
  },

  // Get a single list by ID
  getList: (listId: string): List | null => {
    const lists = storage.getLists();
    return lists.find(list => list.id === listId) || null;
  },

  // Add item to a list
  addItemToList: (listId: string, item: ListItem): List | null => {
    const lists = storage.getLists();
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) return null;
    
    lists[listIndex].items.push(item);
    lists[listIndex].updatedAt = new Date();
    
    storage.saveLists(lists);
    return lists[listIndex];
  },

  // Remove item from a list
  removeItemFromList: (listId: string, itemId: string): List | null => {
    const lists = storage.getLists();
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) return null;
    
    lists[listIndex].items = lists[listIndex].items.filter(item => item.id !== itemId);
    lists[listIndex].updatedAt = new Date();
    
    storage.saveLists(lists);
    return lists[listIndex];
  }
};
