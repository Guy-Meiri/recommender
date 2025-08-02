import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabaseStorage } from './supabase-storage';
import { tmdbApi } from './tmdb';
import type { List, ListItem, TMDBResponse } from '@/types';

// RTK Query API slice for centralized data fetching and caching
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['List', 'Movie'],
  endpoints: (builder) => ({
    // List-related queries
    getLists: builder.query<List[], void>({
      queryFn: async () => {
        try {
          const lists = await supabaseStorage.getLists();
          return { data: lists };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: [{ type: 'List', id: 'LIST' }],
    }),

    getList: builder.query<List | null, string>({
      queryFn: async (listId) => {
        try {
          const list = await supabaseStorage.getList(listId);
          return { data: list };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, listId) => [{ type: 'List', id: listId }],
    }),

    // TMDB search
    searchMovies: builder.query<TMDBResponse, string>({
      queryFn: async (query) => {
        try {
          const result = await tmdbApi.search(query);
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Movie'],
    }),

    // Mutations
    createList: builder.mutation<List | null, Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'items' | 'user_id' | 'isOwner' | 'permission' | 'shares'>>({
      queryFn: async (listData) => {
        try {
          const result = await supabaseStorage.addList(listData);
          return { data: result };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: [{ type: 'List', id: 'LIST' }],
    }),

    updateList: builder.mutation<boolean, { listId: string; updates: Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'items' | 'user_id' | 'isOwner' | 'permission' | 'shares'>> }>({
      queryFn: async ({ listId, updates }) => {
        try {
          const result = await supabaseStorage.updateList(listId, updates);
          return { data: result };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { listId }) => [
        { type: 'List', id: listId },
        { type: 'List', id: 'LIST' },
      ],
    }),

    deleteList: builder.mutation<void, string>({
      queryFn: async (listId) => {
        try {
          await supabaseStorage.deleteList(listId);
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: [{ type: 'List', id: 'LIST' }],
    }),

    addItemToList: builder.mutation<boolean, { listId: string; item: ListItem }>({
      queryFn: async ({ listId, item }) => {
        try {
          const result = await supabaseStorage.addItemToList(listId, item);
          return { data: result };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { listId }) => [{ type: 'List', id: listId }],
    }),

    removeItemFromList: builder.mutation<boolean, { listId: string; tmdbId: number }>({
      queryFn: async ({ listId, tmdbId }) => {
        try {
          const result = await supabaseStorage.removeItemFromList(listId, tmdbId);
          return { data: result };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { listId }) => [{ type: 'List', id: listId }],
    }),

    shareList: builder.mutation<boolean, { listId: string; email: string; permission?: 'read' | 'write' }>({
      queryFn: async ({ listId, email, permission = 'write' }) => {
        try {
          const result = await supabaseStorage.shareList(listId, email, permission);
          return { data: result };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { listId }) => [{ type: 'List', id: listId }],
    }),

    unshareList: builder.mutation<boolean, { listId: string; userId: string }>({
      queryFn: async ({ listId, userId }) => {
        try {
          const result = await supabaseStorage.unshareList(listId, userId);
          return { data: result };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { listId }) => [{ type: 'List', id: listId }],
    }),

    searchUsers: builder.query<Array<{ id: string; email: string }>, string>({
      queryFn: async (emailQuery) => {
        try {
          const users = await supabaseStorage.searchUsers(emailQuery);
          return { data: users };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetListsQuery,
  useGetListQuery,
  useSearchMoviesQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
  useAddItemToListMutation,
  useRemoveItemFromListMutation,
  useShareListMutation,
  useUnshareListMutation,
  useSearchUsersQuery,
} = api;
