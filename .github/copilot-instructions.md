# Copilot Custom Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is "Batata Time" - a movie and TV show recommendation app built with Next.js, TypeScript and Tailwind CSS. The project uses:
- Next.js 15+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code linting
- Source code organized in the `src/` directory

## Development Guidelines
- Use TypeScript for all new files
- Follow Next.js App Router patterns
- Use Tailwind CSS classes for styling
- Ensure components are properly typed
- Follow React and Next.js best practices
- Use proper semantic HTML elements
- Implement responsive design principles

## Code Style
- Use functional components with hooks
- Prefer server components when possible, use client components when needed
- Use proper TypeScript interfaces and types
- Follow consistent naming conventions
- Keep components focused and reusable

## Styling Instructions for GitHub Copilot

Use the `shadcn/ui` component library for all UI components and styling.

### ✅ Guidelines:

- Use Tailwind CSS utility classes for layout, spacing, and responsiveness.
- Prefer pre-built components from `shadcn/ui` when available (e.g., Button, Card, Dialog).
- If a required component is not available in `shadcn/ui`, extend existing ones using Tailwind and Radix primitives.
- Use consistent theming and dark mode support via `shadcn/ui` conventions.

### 📦 Imports:

Use imports like:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
```
