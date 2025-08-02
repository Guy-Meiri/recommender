-- Migration: Add List Sharing Functionality
-- Run this in your Supabase SQL Editor to add sharing capabilities

-- Create list_shares table to track shared lists
CREATE TABLE IF NOT EXISTS list_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('read', 'write')) DEFAULT 'write',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, shared_with_user_id)
);

-- Enable RLS on list_shares
ALTER TABLE list_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for list_shares
CREATE POLICY "Users can view shares of their own lists" ON list_shares
  FOR SELECT USING (
    auth.uid() = shared_by_user_id OR auth.uid() = shared_with_user_id
  );

CREATE POLICY "Users can create shares for their own lists" ON list_shares
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = list_shares.list_id 
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shares of their own lists" ON list_shares
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = list_shares.list_id 
      AND lists.user_id = auth.uid()
    )
  );

-- Update RLS policies for lists to include shared lists
DROP POLICY IF EXISTS "Users can view their own lists" ON lists;
CREATE POLICY "Users can view their own and shared lists" ON lists
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM list_shares 
      WHERE list_shares.list_id = lists.id 
      AND list_shares.shared_with_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own lists" ON lists;
CREATE POLICY "Users can update their own and shared lists with write permission" ON lists
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM list_shares 
      WHERE list_shares.list_id = lists.id 
      AND list_shares.shared_with_user_id = auth.uid()
      AND list_shares.permission = 'write'
    )
  );

-- Update RLS policies for list_items to include shared lists
DROP POLICY IF EXISTS "Users can view items in their own lists" ON list_items;
CREATE POLICY "Users can view items in their own and shared lists" ON list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = list_items.list_id 
      AND (
        lists.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM list_shares 
          WHERE list_shares.list_id = lists.id 
          AND list_shares.shared_with_user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can add items to their own lists" ON list_items;
CREATE POLICY "Users can add items to their own and shared lists with write permission" ON list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = list_items.list_id 
      AND (
        lists.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM list_shares 
          WHERE list_shares.list_id = lists.id 
          AND list_shares.shared_with_user_id = auth.uid()
          AND list_shares.permission = 'write'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update items in their own lists" ON list_items;
CREATE POLICY "Users can update items in their own and shared lists with write permission" ON list_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = list_items.list_id 
      AND (
        lists.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM list_shares 
          WHERE list_shares.list_id = lists.id 
          AND list_shares.shared_with_user_id = auth.uid()
          AND list_shares.permission = 'write'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete items from their own lists" ON list_items;
CREATE POLICY "Users can delete items from their own and shared lists with write permission" ON list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = list_items.list_id 
      AND (
        lists.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM list_shares 
          WHERE list_shares.list_id = lists.id 
          AND list_shares.shared_with_user_id = auth.uid()
          AND list_shares.permission = 'write'
        )
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS list_shares_list_id_idx ON list_shares(list_id);
CREATE INDEX IF NOT EXISTS list_shares_shared_with_user_id_idx ON list_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS list_shares_shared_by_user_id_idx ON list_shares(shared_by_user_id);

-- Create a function to search users by email (safer than a view)
CREATE OR REPLACE FUNCTION public.search_users_by_email(email_query TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    auth.users.id,
    auth.users.email,
    auth.users.created_at
  FROM auth.users
  WHERE auth.users.email ILIKE '%' || email_query || '%'
  AND auth.users.id != auth.uid()
  LIMIT 10;
$$;

-- Create a function to get user email by ID (for displaying shared users)
CREATE OR REPLACE FUNCTION public.get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT auth.users.email
  FROM auth.users
  WHERE auth.users.id = user_id;
$$;
