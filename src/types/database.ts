export interface Database {
  public: {
    Tables: {
      lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          category: 'movies' | 'tv' | 'both';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          category: 'movies' | 'tv' | 'both';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          category?: 'movies' | 'tv' | 'both';
          created_at?: string;
        };
      };
      list_items: {
        Row: {
          id: string;
          list_id: string;
          tmdb_id: number;
          title: string;
          media_type: 'movie' | 'tv';
          poster_path: string | null;
          backdrop_path: string | null;
          added_at: string;
          rating: number | null;
          release_date: string | null;
          genre: string[] | null;
        };
        Insert: {
          id?: string;
          list_id: string;
          tmdb_id: number;
          title: string;
          media_type: 'movie' | 'tv';
          poster_path?: string | null;
          backdrop_path?: string | null;
          added_at?: string;
          rating?: number | null;
          release_date?: string | null;
          genre?: string[] | null;
        };
        Update: {
          id?: string;
          list_id?: string;
          tmdb_id?: number;
          title?: string;
          media_type?: 'movie' | 'tv';
          poster_path?: string | null;
          backdrop_path?: string | null;
          added_at?: string;
          rating?: number | null;
          release_date?: string | null;
          genre?: string[] | null;
        };
      };
      list_shares: {
        Row: {
          id: string;
          list_id: string;
          shared_with_user_id: string;
          shared_by_user_id: string;
          permission: 'read' | 'write';
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          shared_with_user_id: string;
          shared_by_user_id: string;
          permission?: 'read' | 'write';
          created_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          shared_with_user_id?: string;
          shared_by_user_id?: string;
          permission?: 'read' | 'write';
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_users_by_email: {
        Args: {
          email_query: string;
        };
        Returns: {
          id: string;
          email: string;
          created_at: string;
        }[];
      };
      get_user_email: {
        Args: {
          user_id: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}
