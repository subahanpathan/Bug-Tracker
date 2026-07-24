/**
 * Permission Matrix Documentation
 * Role-Based Access Control (RBAC) for Bug Tracker
 *
 * This file documents the permission matrix for all roles in the application.
 * Hardened BOLA/IDOR protection enforces that all resource access (Bugs, Comments, 
 * Attachments) is strictly scoped to the projects the user is authorized to view.
 */

// ====================================
// ROLE HIERARCHY
// ====================================
// Owner (4) > Admin (3) > Developer (2) > Viewer (1)
//
// Owner: Project creator with full control
// Admin: Administrative access, can manage team and tickets
// Developer: Can create and modify tickets
// Viewer: Read-only access
//
// ====================================
// TICKET PERMISSIONS
// ====================================

// ticket:create - Create new tickets
// Allowed: Owner, Admin, Developer
// Denied: Viewer
// Example: POST /api/bugs
//   Developer can create but not view other projects

// ticket:read - View/read tickets
// Allowed: Owner, Admin, Developer, Viewer
// Example: GET /api/bugs?projectId=PROJECT_ID
//   All members can read tickets in their project

// ticket:update - Edit ticket details
// Allowed: Owner, Admin, Developer (own/assigned only)
// Example: PUT /api/bugs/:id
//   Developer can only edit tickets they created or are assigned to
//   Admin can edit any ticket
//   Owner can edit any ticket
//   Viewer cannot edit

// ticket:delete - Delete tickets
// Allowed: Owner, Admin
// Denied: Developer, Viewer
// Example: DELETE /api/bugs/:id

// ticket:assign - Assign ticket to user
// Allowed: Owner, Admin
// Denied: Developer, Viewer
// Example: POST /api/bugs/:id/assign
//   Only admins can reassign tickets

// ticket:change_status - Update ticket status
// Allowed: Owner, Admin, Developer
// Denied: Viewer
// Example: PUT /api/bugs/:id (status field)

// ====================================
// COMMENT PERMISSIONS
// ====================================

// comment:create - Add comments to ticket
// Allowed: Owner, Admin, Developer, Viewer
// Example: POST /api/comments

// comment:read - View comments
// Allowed: Owner, Admin, Developer, Viewer
// Example: GET /api/tickets/:id/comments

// comment:update - Edit own comments
// Allowed: Authors (of the comment), Admin, Owner
// Denied: Developers (non-author), Viewers
// Example: PUT /api/comments/:id
//   Hardened check: userId === comment.user_id OR user is project admin

// comment:delete - Delete comments
// Allowed: Authors (of the comment), Admin, Owner
// Denied: Developers (non-author), Viewers
// Example: DELETE /api/comments/:id
//   Hardened check: userId === comment.user_id OR user is project admin

// ====================================
// ATTACHMENT PERMISSIONS
// ====================================

// attachment:upload - Upload files to ticket
// Allowed: Owner, Admin, Developer
// Denied: Viewer
// Example: POST /api/attachments

// attachment:download - Download files (via Secure Streaming)
// Allowed: Owner, Admin, Developer, Viewer
// Example: GET /api/attachments/stream/:filename
//   Requires project membership. Public static access is disabled.

// attachment:delete - Delete files
// Allowed: Author (of attachment), Admin, Owner
// Denied: Developers (non-author), Viewers
// Example: DELETE /api/attachments/:id

// ====================================
// PROJECT PERMISSIONS
// ====================================

// project:read - View project details
// Allowed: Owner, Admin, Developer, Viewer
// Example: GET /api/projects/:id

// project:update - Edit project details (name, description)
// Allowed: Owner (only)
// Denied: Admin, Developer, Viewer
// Example: PUT /api/projects/:id
//   Only project owner can update settings

// project:delete - Delete project
// Allowed: Owner (only)
// Denied: Admin, Developer, Viewer
// Example: DELETE /api/projects/:id

// project:manage_members - Manage team members
// Allowed: Owner, Admin
// Denied: Developer, Viewer
// Example: POST /api/projects/:id/members (add)
//   Only admins can add/remove members

// project:export - Export project data
// Allowed: Owner, Admin, Developer
// Denied: Viewer
// Example: GET /api/projects/:id/export

// ====================================
// TEAM PERMISSIONS
// ====================================

// team:add_member - Add new team member
// Allowed: Owner, Admin
// Denied: Developer, Viewer
// Example: POST /api/projects/:id/members

// team:remove_member - Remove team member
// Allowed: Owner, Admin
// Denied: Developer, Viewer
// Example: DELETE /api/projects/:id/members/:memberId

// team:change_role - Change member role
// Allowed: Owner, Admin
// Denied: Developer, Viewer
// Example: PUT /api/projects/:id/members/:memberId

// team:view_members - View team members
// Allowed: Owner, Admin, Developer, Viewer
// Example: GET /api/projects/:id/members

// ====================================
// IMPLEMENTATION EXAMPLES
// ====================================

/*
 * BACKEND ROUTE WITH MIDDLEWARE
 *
 * Example 1: Create Ticket (Developer role required)
 * router.post('/bugs', authMiddleware, isDeveloperOrAbove, asyncHandler(async (req, res) => {
 *   // isDeveloperOrAbove middleware ensures user is Developer or higher
 *   // Creates ticket with req.userId as reporter
 * }));
 *
 * Example 2: Edit Ticket (Can only edit own/assigned)
 * router.put('/bugs/:id', authMiddleware, canEditTicket, asyncHandler(async (req, res) => {
 *   // canEditTicket middleware checks:
 *   // - If Owner: Can edit
 *   // - If Admin: Can edit
 *   // - If Developer: Can only edit if creator or assigned
 *   // - If Viewer: Forbidden
 * }));
 *
 * Example 3: Delete Ticket (Admin only)
 * router.delete('/bugs/:id', authMiddleware, canDeleteTicket, asyncHandler(async (req, res) => {
 *   // canDeleteTicket middleware checks:
 *   // - If Owner: Can delete
 *   // - If Admin: Can delete
 *   // - If Developer/Viewer: Forbidden
 * }));
 *
 * Example 4: Assign Ticket (Admin only)
 * router.post('/bugs/:id/assign', authMiddleware, canAssignTicket, asyncHandler(async (req, res) => {
 *   // canAssignTicket middleware checks:
 *   // - If Owner: Can assign
 *   // - If Admin: Can assign
 *   // - If Developer/Viewer: Forbidden
 * }));
 *
 * Example 5: Manage Team (Owner only)
 * router.post('/projects/:id/members', authMiddleware, isProjectOwner, asyncHandler(async (req, res) => {
 *   // isProjectOwner middleware ensures user is the project owner
 *   // Adds member to project
 * }));
 */

// ====================================
// MIDDLEWARE CHAIN EXAMPLES
// ====================================

/*
 * Route: GET /api/projects/:id/tickets
 * Public: No | Auth: Yes | Role: Developer+ | Resource: Project
 * Middleware: authMiddleware -> isDeveloperOrAbove
 * Response: 200 (list of tickets) | 401 (not auth) | 403 (viewer role)
 *
 * Route: POST /api/projects/:id/members
 * Public: No | Auth: Yes | Role: Owner | Resource: Project
 * Middleware: authMiddleware -> isProjectOwner
 * Response: 201 (member added) | 401 (not auth) | 403 (not owner)
 *
 * Route: PUT /api/bugs/:id
 * Public: No | Auth: Yes | Role: Developer+ | Resource: Ticket
 * Middleware: authMiddleware -> canEditTicket
 * Response: 200 (updated) | 401 (not auth) | 403 (can't edit)
 *
 * Route: DELETE /api/bugs/:id
 * Public: No | Auth: Yes | Role: Admin+ | Resource: Ticket
 * Middleware: authMiddleware -> canDeleteTicket
 * Response: 200 (deleted) | 401 (not auth) | 403 (not admin)
 */

// ====================================
// PERMISSION ENFORCEMENT FLOW
// ====================================

/*
 * 1. Request arrives at endpoint
 * 2. authMiddleware validates JWT token and extracts user
 * 3. Resource-specific middleware (e.g., canEditTicket) executes:
 *    a. Get ticket from database
 *    b. Get user's role in project
 *    c. Check if role has permission
 *    d. If denied: return 403 Forbidden
 *    e. If allowed: attach role to req and call next()
 * 4. Route handler executes with permission verified
 * 5. Response sent back to client
 */

export const PERMISSION_MATRIX = {
  // Format: 'resource:action': [role1, role2, ...]
  // Roles are case-sensitive: 'owner', 'admin', 'developer', 'viewer'

  TICKETS: {
    CREATE: ['owner', 'admin', 'developer'],
    READ: ['owner', 'admin', 'developer', 'viewer'],
    UPDATE_OWN: ['owner', 'admin', 'developer'],
    UPDATE_ANY: ['owner', 'admin'],
    DELETE: ['owner', 'admin'],
    ASSIGN: ['owner', 'admin'],
    CHANGE_STATUS: ['owner', 'admin', 'developer']
  },

  COMMENTS: {
    CREATE: ['owner', 'admin', 'developer', 'viewer'],
    READ: ['owner', 'admin', 'developer', 'viewer'],
    UPDATE_OWN: ['owner', 'admin'],
    DELETE_OWN: ['owner', 'admin']
  },

  ATTACHMENTS: {
    UPLOAD: ['owner', 'admin', 'developer'],
    DOWNLOAD: ['owner', 'admin', 'developer', 'viewer'],
    DELETE: ['owner', 'admin']
  },

  PROJECTS: {
    READ: ['owner', 'admin', 'developer', 'viewer'],
    UPDATE: ['owner'],
    DELETE: ['owner'],
    EXPORT: ['owner', 'admin', 'developer']
  },

  TEAM: {
    ADD_MEMBER: ['owner', 'admin'],
    REMOVE_MEMBER: ['owner', 'admin'],
    CHANGE_ROLE: ['owner', 'admin'],
    VIEW_MEMBERS: ['owner', 'admin', 'developer', 'viewer']
  }
};
