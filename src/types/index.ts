// Data models for the movie/TV show recommendation app

export interface List {
  id: string;
  name: string;
  description?: string;
  category: 'movies' | 'tv' | 'both';
  createdAt: Date;
  updatedAt: Date;
  items: ListItem[];
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
  addedAt: Date;
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
