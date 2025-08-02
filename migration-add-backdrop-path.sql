-- Migration: Add backdrop_path column to list_items table
-- Run this in your Supabase SQL Editor

ALTER TABLE list_items 
ADD COLUMN IF NOT EXISTS backdrop_path TEXT;

-- Add index for backdrop_path if needed
CREATE INDEX IF NOT EXISTS list_items_backdrop_path_idx ON list_items(backdrop_path) WHERE backdrop_path IS NOT NULL;
