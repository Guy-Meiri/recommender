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
          added_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          tmdb_id: number;
          title: string;
          media_type: 'movie' | 'tv';
          poster_path?: string | null;
          added_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          tmdb_id?: number;
          title?: string;
          media_type?: 'movie' | 'tv';
          poster_path?: string | null;
          added_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
