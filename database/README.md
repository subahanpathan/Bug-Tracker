# Database Schema

## Overview
Professional Bug Tracker uses Supabase (PostgreSQL) for data storage. This document describes the complete database schema.

## Tables

### 1. Users
Stores user account information and authentication data.

**Columns:**
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email address
- `first_name` (VARCHAR) - User's first name
- `last_name` (VARCHAR) - User's last name
- `password_hash` (VARCHAR) - Hashed password
- `role` (VARCHAR) - User role (admin, manager, developer)
- `avatar_url` (TEXT) - Profile picture URL
- `status` (VARCHAR) - Account status (active, inactive)
- `created_at` (TIMESTAMP) - Account creation time
- `updated_at` (TIMESTAMP) - Last update time
- `deleted_at` (TIMESTAMP) - Soft delete timestamp

### 2. Projects
Organizes bugs into logical project groups.

**Columns:**
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Project name
- `key` (VARCHAR) - Unique project key (e.g., PROJ)
- `description` (TEXT) - Project description
- `owner_id` (UUID) - Reference to owner user
- `status` (VARCHAR) - Project status
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time
- `deleted_at` (TIMESTAMP) - Soft delete timestamp

### 3. Bugs
Individual bug/issue records.

**Columns:**
- `id` (UUID) - Primary key
- `project_id` (UUID) - Reference to project
- `title` (VARCHAR) - Bug title
- `description` (TEXT) - Detailed description
- `priority` (VARCHAR) - Priority level (low, medium, high, critical)
- `status` (VARCHAR) - Status (open, in-progress, resolved, closed)
- `reporter_id` (UUID) - User who reported the bug
- `assignee_id` (UUID) - User assigned to fix the bug
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time
- `resolved_at` (TIMESTAMP) - When bug was resolved
- `deleted_at` (TIMESTAMP) - Soft delete timestamp

### 4. Comments
Discussion and collaboration on bugs.

**Columns:**
- `id` (UUID) - Primary key
- `bug_id` (UUID) - Reference to bug
- `author_id` (UUID) - User who wrote the comment
- `content` (TEXT) - Comment content
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time
- `deleted_at` (TIMESTAMP) - Soft delete timestamp

### 5. Attachments
File attachments for bug reports (screenshots, logs, etc.).

**Columns:**
- `id` (UUID) - Primary key
- `bug_id` (UUID) - Reference to bug
- `file_name` (VARCHAR) - Stored file name
- `original_name` (VARCHAR) - Original file name
- `file_size` (BIGINT) - File size in bytes
- `file_path` (VARCHAR) - Storage path
- `mime_type` (VARCHAR) - MIME type
- `uploaded_by` (UUID) - User who uploaded the file
- `created_at` (TIMESTAMP) - Upload time
- `deleted_at` (TIMESTAMP) - Soft delete timestamp

### 6. Activity Logs (Optional)
Tracks changes to bugs for audit trail.

**Columns:**
- `id` (UUID) - Primary key
- `bug_id` (UUID) - Reference to bug
- `user_id` (UUID) - User making the change
- `action` (VARCHAR) - Action performed
- `old_value` (TEXT) - Previous value
- `new_value` (TEXT) - New value
- `created_at` (TIMESTAMP) - Change time

## Relationships

```
Users (1) ──── (many) Projects
Users (1) ──── (many) Bugs (reporter)
Users (1) ──── (many) Bugs (assignee)
Users (1) ──── (many) Comments
Users (1) ──── (many) Attachments
Projects (1) ──── (many) Bugs
Bugs (1) ──── (many) Comments
Bugs (1) ──── (many) Attachments
Bugs (1) ──── (many) Activity Logs
```

## Indexes

Indexes are created on frequently queried columns:
- `projects(owner_id)` - Find projects by owner
- `bugs(project_id)` - Find bugs by project
- `bugs(status)` - Filter by status
- `bugs(priority)` - Filter by priority
- `comments(bug_id)` - Get bug comments
- `attachments(bug_id)` - Get bug attachments

## Security

### Row Level Security (RLS)
- Users can only view their own profile
- Projects and bugs are viewable by team members
- Comments and attachments are viewable with their parent bug

## Setup Instructions

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor
4. Copy and paste the contents of `schema.sql`
5. Execute the SQL to create all tables and indexes
6. Enable RLS policies in the Supabase dashboard
7. Copy your Supabase URL and API keys to the `.env` file
