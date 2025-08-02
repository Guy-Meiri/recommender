import { TMDBResponse, TMDBSearchResult } from '@/types';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

// For now, we'll use a mock API until you get your TMDB API key
const MOCK_SEARCH_RESULTS: TMDBSearchResult[] = [
  {
    id: 550,
    title: 'Fight Club',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/87hTDiay2N2qWyX4Ds7ybXi9h8I.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
    genre_ids: [18, 53],
    media_type: 'movie'
  },
  {
    id: 13,
    title: 'Forrest Gump',
    poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    backdrop_path: '/7c9UVPPiTPltouxRVY6N9uugaVA.jpg',
    release_date: '1994-06-23',
    vote_average: 8.5,
    genre_ids: [18, 10749],
    media_type: 'movie'
  },
  {
    id: 1399,
    name: 'Game of Thrones',
    poster_path: '/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg',
    backdrop_path: '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    first_air_date: '2011-04-17',
    vote_average: 8.3,
    genre_ids: [18, 10759, 10765],
    media_type: 'tv'
  },
  {
    id: 1396,
    name: 'Breaking Bad',
    poster_path: '/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg',
    backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    first_air_date: '2008-01-20',
    vote_average: 9.5,
    genre_ids: [18, 80],
    media_type: 'tv'
  }
];

export const tmdbApi = {
  // Search for movies and TV shows
  search: async (query: string): Promise<TMDBResponse> => {
    console.log('TMDB API Key available:', !!TMDB_API_KEY);
    console.log('Search query:', query);

    // If no API key, return mock data
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_api_key_here') {
      console.log('Using mock data');
      const filteredResults = MOCK_SEARCH_RESULTS.filter(item =>
        (item.title || item.name)?.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        page: 1,
        results: filteredResults,
        total_pages: 1,
        total_results: filteredResults.length
      };
    }

    console.log('Using real TMDB API');
    try {
      const searchUrl = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
      console.log('Search URL:', searchUrl.replace(TMDB_API_KEY, '[API_KEY]'));
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        console.error('TMDB API response not ok:', response.status, response.statusText);
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('TMDB API response:', data);
      
      // Filter to only include movies and TV shows
      const filteredResults = data.results.filter((item: TMDBSearchResult) => 
        item.media_type === 'movie' || item.media_type === 'tv'
      );
      
      return {
        ...data,
        results: filteredResults
      };
    } catch (error) {
      console.error('TMDB search error:', error);
      // Fallback to mock data if API fails
      const filteredResults = MOCK_SEARCH_RESULTS.filter(item =>
        (item.title || item.name)?.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        page: 1,
        results: filteredResults,
        total_pages: 1,
        total_results: filteredResults.length
      };
    }
  },

  // Get full poster URL
  getPosterUrl: (posterPath?: string): string => {
    if (!posterPath) return '/placeholder-poster.jpg';
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
  },

  // Get full backdrop URL
  getBackdropUrl: (backdropPath?: string): string => {
    if (!backdropPath) return '';
    return `${TMDB_BACKDROP_BASE_URL}${backdropPath}`;
  },

  // Get movie/TV show details by ID
  getDetails: async (id: number, mediaType: 'movie' | 'tv') => {
    if (!TMDB_API_KEY) {
      // Return mock data for the requested item
      const mockItem = MOCK_SEARCH_RESULTS.find(item => item.id === id);
      return mockItem || null;
    }

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get TMDB details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('TMDB details error:', error);
      throw error;
    }
  }
};
