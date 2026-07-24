-- Phase 3: Email Notifications & Activity Feed Database Migration
-- Run this migration in Supabase to add email preferences and activity logs tables

-- Create email_preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  ticket_created BOOLEAN DEFAULT true,
  ticket_assigned BOOLEAN DEFAULT true,
  ticket_updated BOOLEAN DEFAULT true,
  comment_added BOOLEAN DEFAULT true,
  team_updates BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  weekly_summary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES projects ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'commented', 'assigned')),
  entity_type TEXT NOT NULL, -- 'ticket', 'comment', 'project_member', 'project'
  entity_id UUID,
  details TEXT NOT NULL,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_created ON activity_logs(project_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_preferences
DROP POLICY IF EXISTS "Users can view their own email preferences" ON email_preferences;
CREATE POLICY "Users can view their own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own email preferences" ON email_preferences;
CREATE POLICY "Users can update their own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own email preferences" ON email_preferences;
CREATE POLICY "Users can insert their own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activity_logs
DROP POLICY IF EXISTS "Users can view activity logs for their projects" ON activity_logs;
CREATE POLICY "Users can view activity logs for their projects"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = activity_logs.project_id
      AND project_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = activity_logs.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Only system/server can insert activity logs (not through client)
DROP POLICY IF EXISTS "Only server can insert activity logs" ON activity_logs;
CREATE POLICY "Only server can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (false); -- Disable client-side inserts

-- Create trigger to update email_preferences updated_at timestamp
DROP TRIGGER IF EXISTS update_email_preferences_updated_at ON email_preferences;
CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON email_preferences
  FOR EACH ROW EXECUTE FUNCTION update_email_preferences_updated_at();

-- Function to auto-create email preferences for new users
DROP TRIGGER IF EXISTS create_email_preferences_on_user_signup ON auth.users;
CREATE OR REPLACE FUNCTION create_email_preferences_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically create email preferences when user signs up
CREATE TRIGGER create_email_preferences_on_user_signup
AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_email_preferences_on_signup();
