-- Phase 2: Notifications & Filters Database Migration
-- Run this migration in Supabase to add notifications and filters tables

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ticket_created', 'ticket_updated', 'ticket_assigned', 'comment_added', 'ticket_status_changed', 'team_member_added')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  project_id UUID REFERENCES projects ON DELETE SET NULL,
  ticket_id UUID REFERENCES bugs ON DELETE SET NULL,
  related_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create filters table
CREATE TABLE IF NOT EXISTS filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL, -- {status: [], priority: [], assignee: [], issue_type: []}
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id, is_default) WHERE is_default = true
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_project_id ON notifications(project_id);
CREATE INDEX idx_notifications_ticket_id ON notifications(ticket_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_filters_user_project ON filters(user_id, project_id);
CREATE INDEX idx_filters_is_default ON filters(is_default);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE filters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for filters
CREATE POLICY "Users can view their own filters"
  ON filters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create filters"
  ON filters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filters"
  ON filters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filters"
  ON filters FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_filters_updated_at BEFORE UPDATE ON filters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
