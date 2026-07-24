# Phase 2: Notifications & Real-Time Updates

## Overview

Phase 2 introduces a real-time notification system and persistent filter preferences, enabling users to:
- Receive instant notifications for ticket updates and team actions
- Save and reuse filter configurations for quick access
- See active team members on projects
- Get typing indicators for collaborative editing

## Features

### 1. Real-Time Notifications

#### Notification Types
- `ticket_created` - New ticket created in project
- `ticket_updated` - Ticket details modified
- `ticket_assigned` - Assigned to or reassigned from user
- `ticket_status_changed` - Ticket status moved
- `comment_added` - New comment on ticket
- `team_member_added` - New member added to project

#### Components
- **Notification Bell**: Shows unread count in navbar, displays recent 5 notifications
- **Notification Center**: Dedicated page for viewing all notifications
- **Real-time Sync**: Socket.io handles instant updates

### 2. Saved Filters

#### Features
- Save current filter state with a name
- Load saved filters with one click
- Set default filter per project
- Delete filters
- Local storage backup for quick access

#### Filter Configuration
```javascript
{
  status: ['open', 'in-progress'],      // Array of statuses
  priority: ['high', 'critical'],        // Array of priorities
  assignee: ['user-id-1', 'user-id-2'],  // Array of user IDs
  issue_type: ['bug', 'feature']         // Array of issue types
}
```

### 3. User Presence

Track which team members are actively viewing a project:
- See active user list in project
- Know when teammates are online
- Typing indicators for comment editing

## Setup Instructions

### Backend Setup

#### 1. Database Migration

Run the migration in Supabase SQL editor:

```bash
# Copy and run contents of:
docs/migrations/002_add_notifications_and_filters.sql
```

This creates:
- `notifications` table
- `filters` table
- RLS policies
- Indexes
- Auto-update triggers

#### 2. Install Socket.io

```bash
npm install socket.io
```

#### 3. Initialize Socket.io in Server

Update your main server file (e.g., `server.js`):

```javascript
import { Server } from 'socket.io';
import { initializeSocketHandlers } from './utils/socketManager.js';

// After creating HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Initialize socket handlers
initializeSocketHandlers(io);

// Export io for use in routes
export { io };
```

#### 4. Register API Routes

In your main Express app:

```javascript
import notificationRoutes from './routes/notificationRoutes.js';
import filterRoutes from './routes/filterRoutes.js';

app.use('/api/notifications', notificationRoutes);
app.use('/api/filters', filterRoutes);
```

#### 5. Integrate Notifications on Ticket Updates

Update ticket route handlers to emit notifications:

```javascript
import { io } from '../server.js';
import notificationService from '../services/notificationService.js';

// After updating a ticket
const updatedTicket = await bugService.updateBug(ticketId, data);

// Notify team
await notificationService.notifyTeam(projectId, userId, {
  title: 'Ticket Updated',
  message: `${ticket.title} was updated by ${user.firstName}`,
  type: 'ticket_updated',
  ticketId,
});

// Emit socket event for real-time update
io.to(`project_${projectId}`).emit('ticket_updated', {
  ticket: updatedTicket,
  updatedBy: userId,
});
```

### Frontend Setup

#### 1. Install Socket.io Client

```bash
npm install socket.io-client
```

#### 2. Configure Environment

Add to `.env.local`:

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

#### 3. Verify Components are in Place

- ✅ `frontend/src/components/NotificationBell.jsx`
- ✅ `frontend/src/components/FilterBar.jsx`
- ✅ `frontend/src/pages/NotificationCenterPage.jsx`
- ✅ `frontend/src/hooks/useSocket.js`
- ✅ `frontend/src/services/notificationService.js`
- ✅ `frontend/src/services/filterService.js`

#### 4. Routes Added to App.jsx

- `/notifications` - Notification center page
- Navbar includes NotificationBell component

## Usage

### For End Users

#### Viewing Notifications

1. Click the bell icon (🔔) in navbar
2. See recent 5 notifications in dropdown
3. Click "View all notifications" to see full list
4. Mark as read (shows blue dot when unread)
5. Delete individual notifications

#### Managing Filters

1. Set desired filters (status, priority, assignee, type)
2. Click "Save filters" button
3. Enter name and confirm
4. Access via "Saved filters" dropdown
5. Click filter to load immediately

### For Developers

#### Emit Custom Notifications

```javascript
import notificationService from '../services/notificationService.js';

await notificationService.createNotification(userId, {
  type: 'custom_event',
  title: 'Something happened',
  message: 'Description here',
  projectId,
  ticketId,
});
```

#### Emit Socket Events

```javascript
import { io } from '../server.js';

io.to(`project_${projectId}`).emit('custom_event', {
  data: eventData,
  timestamp: new Date().toISOString(),
});
```

#### Load User Filters on Page

```javascript
import filterService from '../services/filterService.js';

const filters = await filterService.getProjectFilters(projectId);
const defaultFilter = await filterService.getDefaultFilter(projectId);
```

## API Endpoints

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications (paginated) |
| GET | `/api/notifications/unread/count` | Get unread count |
| GET | `/api/notifications/type/:type` | Get notifications by type |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |
| DELETE | `/api/notifications` | Delete all notifications |

### Filters

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/filters` | Create new filter |
| GET | `/api/filters/project/:projectId` | Get project filters |
| GET | `/api/filters/:id` | Get specific filter |
| PUT | `/api/filters/:id` | Update filter |
| DELETE | `/api/filters/:id` | Delete filter |
| PUT | `/api/filters/project/:projectId/default` | Set default filter |
| GET | `/api/filters/project/:projectId/default` | Get default filter |

## Socket.io Events

### Server → Client

```javascript
// New notification
'notification_created' - Emits new notification object

// Ticket updates
'ticket_created'
'ticket_updated'
'ticket_deleted'
'ticket_status_changed'

// Comments
'comment_added'
'comment_deleted'

// Presence
'users_in_project' - {projectId, activeUsers, count}
'typing_indicator' - {userId, userName, ticketId, isTyping}
```

### Client → Server

```javascript
// User joining project
socket.emit('join_project', projectId)

// User leaving project
socket.emit('leave_project', projectId)

// Set user ID mapping
socket.emit('set_user_id', userId)

// Typing indicator
socket.emit('typing_indicator', {projectId, ticketId, userName})
```

## Performance Considerations

1. **Notification Pagination**: Uses 20 per page, query 50 max
2. **Socket Rooms**: Users only receive events for projects they're in
3. **Unread Index**: Query optimized with `is_read` index
4. **Reconnection**: Auto-reconnects with exponential backoff (max 5 attempts)
5. **Cleanup**: Socket connections cleaned up on logout

## Testing Checklist

- [ ] Notification bell shows unread count badge
- [ ] Clicking notification navigates to ticket
- [ ] Mark as read updates UI
- [ ] Delete notification removes from list
- [ ] Save filter captures current state
- [ ] Load filter applies stored config
- [ ] Socket reconnects after disconnect
- [ ] Notification center shows all notifications
- [ ] Mark all read works in center
- [ ] Mobile responsive (44px+ buttons)

## Troubleshooting

### Notifications not appearing

1. Check Socket.io connection in browser console
2. Verify `auth` token is valid
3. Ensure `set_user_id` emitted after connect
4. Check backend notification service logs

### Filters not saving

1. Verify database migration ran
2. Check RLS policies are active
3. Ensure `project_id` exists
4. Validate filter config JSON

### Real-time updates not syncing

1. Verify Socket.io URL in `.env.local`
2. Check CORS configuration
3. Ensure server emitting to correct room
4. Verify client listening to events

## Future Enhancements

- Email notifications via SendGrid
- Notification preferences per user
- Advanced filter with custom logic
- Activity feed showing all team actions
- Real-time cursor tracking (who's editing)
- Sound/desktop notifications
