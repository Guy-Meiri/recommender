-- Migration to add missing fields to list_items table
-- Run this in your Supabase SQL Editor

-- Add rating field
ALTER TABLE list_items ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1);

-- Add release_date field  
ALTER TABLE list_items ADD COLUMN IF NOT EXISTS release_date TEXT;

-- Add genre field (stored as JSON array)
ALTER TABLE list_items ADD COLUMN IF NOT EXISTS genre JSONB;

-- Create index on rating for potential sorting
CREATE INDEX IF NOT EXISTS list_items_rating_idx ON list_items(rating);
