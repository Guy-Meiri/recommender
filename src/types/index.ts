// Data models for the movie/TV show recommendation app

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface ListShare {
  id: string;
  list_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  permission: 'read' | 'write';
  created_at: string;
  user_profile?: UserProfile;
}

export interface List {
  id: string;
  name: string;
  description?: string;
  category: 'movies' | 'tv' | 'both';
  createdAt: string; // Changed from Date to string (ISO format)
  updatedAt: string; // Changed from Date to string (ISO format)
  items: ListItem[];
  user_id: string;
  isOwner?: boolean; // Made optional for backward compatibility
  permission?: 'read' | 'write'; // Made optional for backward compatibility
  shares?: ListShare[]; // Made optional for backward compatibility
}

export interface ListItem {
  id: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  releaseDate?: string;
  rating?: number;
  genre?: string[];
  addedAt: string; // Changed from Date to string (ISO format)
}

export interface TMDBSearchResult {
  id: number;
  title?: string; // for movies
  name?: string;  // for TV shows
  poster_path?: string;
  release_date?: string; // for movies
  first_air_date?: string; // for TV shows
  vote_average?: number;
  genre_ids?: number[];
  media_type: 'movie' | 'tv';
}

export interface TMDBResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}
