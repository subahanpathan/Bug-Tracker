-- Migration: Add issue_type column to bugs table
-- Date: April 18, 2026
-- Description: Adds support for Issue Types (bug, feature, task)

-- Add the issue_type column to bugs table
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS issue_type VARCHAR(50) DEFAULT 'bug';

-- Add constraint to validate issue types
ALTER TABLE bugs ADD CONSTRAINT valid_issue_type 
  CHECK (issue_type IN ('bug', 'feature', 'task'));

-- Create index for querying by issue_type
CREATE INDEX IF NOT EXISTS idx_bugs_issue_type ON bugs(issue_type);

-- Add comment to document the column
COMMENT ON COLUMN bugs.issue_type IS 'Type of issue: bug, feature, or task';
