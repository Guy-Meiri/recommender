# Batata Time 🍠

A personalized movie and TV show recommendation app built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎬 Create and manage multiple recommendation lists
- 🔍 Search movies and TV shows using TMDB API
- 📱 Responsive design for all devices  
- 🌙 Dark mode support
- 📊 Beautiful UI with shadcn/ui components
- 💾 Local storage persistence

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

To use real movie data, add your TMDB API key to `.env.local`:

```bash
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

Get your free API key at [themoviedb.org](https://www.themoviedb.org/settings/api).

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **API**: TMDB (The Movie Database)
- **Storage**: Local Storage (Phase 1)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
