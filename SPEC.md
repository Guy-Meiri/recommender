# Movie & TV Show Recommender App - Specification

## Overview
A web application for creating and managing personalized movie and TV show recommendation lists.

## Core Features

### 1. Main Dashboard (Home Page)
- **Display existing recommendation lists** as cards/tiles
- **Create new list button** - opens modal/form to create a new list
- **List preview** - show first few items from each list
- **List metadata** - name, creation date, item count
- **Delete/Edit list options** - manage existing lists

### 2. List Management
- **Create List**: Name, optional description, category (Movies/TV Shows/Both)
- **Edit List**: Update name, description, settings
- **Delete List**: Remove entire list with confirmation
- **List Categories**: Movies only, TV Shows only, or Mixed

### 3. Individual List Page
- **List header** - name, description, item count
- **Add new item button** - search and add movies/TV shows
- **Item grid/list view** - display all items in the list
- **Item details** - poster, title, year, rating, genre
- **Remove item** - delete from list
- **Reorder items** - drag & drop or up/down buttons

### 4. Movie/TV Show Search & Add
- **Search functionality** - find movies/TV shows by title
- **Search results** - display with poster, title, year, rating
- **Add to list** - select items to add to current list
- **Item details** - view more info before adding

## Technical Requirements

### Frontend
- **Framework**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **TypeScript**: Full type safety
- **State Management**: React hooks (useState, useEffect)
- **Data Storage**: Local Storage (Phase 1) → Database (Phase 2)

### API Integration
- **Movie/TV Data**: TMDB API (The Movie Database)
- **Search**: Real-time search with debouncing
- **Images**: Poster URLs from TMDB

### Pages Structure
```
/                    - Main dashboard (list of lists)
/list/[id]          - Individual list page
/search             - Search and add items (modal or page)
```

### Data Models

#### List
```typescript
interface List {
  id: string;
  name: string;
  description?: string;
  category: 'movies' | 'tv' | 'both';
  createdAt: Date;
  updatedAt: Date;
  items: ListItem[];
}
```

#### ListItem
```typescript
interface ListItem {
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
```

## User Experience Flow

1. **Landing** → User sees all their recommendation lists
2. **Create List** → Modal opens, user creates new list
3. **Select List** → Navigate to list detail page
4. **Add Items** → Search movies/shows and add to list
5. **Manage List** → View, reorder, remove items

## Phase 1 (MVP)
- ✅ Basic list creation and management
- ✅ Movie/TV show search via TMDB API
- ✅ Add/remove items from lists
- ✅ Local storage persistence
- ✅ Responsive design

## Phase 2 (Enhanced)
- 🔄 User authentication
- 🔄 Cloud database storage
- 🔄 Share lists with others
- 🔄 Advanced filtering and sorting
- 🔄 Recommendations based on lists
- 🔄 Export lists

## Design Priorities
- **Clean & Intuitive**: Easy to understand interface
- **Mobile-First**: Responsive design for all devices
- **Fast Performance**: Quick search and navigation
- **Accessible**: WCAG compliant components
- **Dark Mode**: Built-in theme support

## Success Metrics
- User can create a list in < 30 seconds
- Search results appear in < 2 seconds
- App works seamlessly on mobile and desktop
- Lists persist between sessions
