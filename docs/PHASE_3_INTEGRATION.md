// Phase 3 Integration Guide: Adding Email & Activity Logging to Ticket Routes
// This file shows how to integrate emailService and activityService into bugRoutes.js

// ============================================================================
// STEP 1: Import the Services at the Top of bugRoutes.js
// ============================================================================

/*
Add these imports:

import emailService from '../services/emailService.js';
import activityService from '../services/activityService.js';
import emailPreferenceService from '../services/emailPreferenceService.js';
*/

// ============================================================================
// STEP 2: MODIFY CREATE TICKET ROUTE
// ============================================================================

// BEFORE: Current create ticket handler
/*
router.post('/', authMiddleware, isDeveloperOrAbove, asyncHandler(async (req, res) => {
  // ... validation code ...
  
  const { data, error } = await supabase
    .from('bugs')
    .insert([{...}])
    .select(...);

  if (error) return res.status(400).json({ status: 'error', message: error.message });

  res.status(201).json({ status: 'success', message: 'Ticket created successfully', data: data[0] });
}));
*/

// AFTER: With email and activity logging
router.post('/', authMiddleware, isDeveloperOrAbove, asyncHandler(async (req, res) => {
  const { title, description, projectId, priority = 'medium', issueType = 'bug', assigneeId } = req.body;

  // ... (all existing validation code remains the same) ...

  // Create ticket
  const { data, error } = await supabase
    .from('bugs')
    .insert([{
      title: title.trim(),
      description: description?.trim() || null,
      project_id: projectId,
      priority,
      issue_type: issueType,
      status: 'open',
      assignee_id: assigneeId || null,
      reporter_id: req.userId
    }])
    .select(`
      *,
      reporter:reporter_id(id, first_name, last_name, email, avatar_url),
      assignee:assignee_id(id, first_name, last_name, email, avatar_url)
    `);

  if (error) {
    return res.status(400).json({ status: 'error', message: error.message });
  }

  const ticket = data[0];

  // ===== NEW: Log Activity =====
  try {
    await activityService.logActivity({
      userId: req.userId,
      projectId,
      action: 'created',
      entityType: 'ticket',
      entityId: ticket.id,
      details: `Created ticket: ${ticket.title}`,
      changes: null
    });
  } catch (activityError) {
    console.error('Failed to log activity:', activityError);
    // Don't fail the request if activity logging fails
  }

  // ===== NEW: Send Emails to Project Members =====
  try {
    const { data: projectMembers, error: membersError } = await supabase
      .from('project_members')
      .select('user_id, users(id, email, first_name, last_name)')
      .eq('project_id', projectId);

    if (!membersError && projectMembers) {
      for (const member of projectMembers) {
        // Check if user has email notifications enabled
        const shouldSend = await emailPreferenceService.shouldSendEmail(
          member.user_id,
          'ticket_created'
        );

        if (shouldSend && member.users?.email) {
          await emailService.sendTicketCreatedEmail(
            member.users,
            ticket,
            { id: projectId, name: project.name }
          );
        }
      }
    }
  } catch (emailError) {
    console.error('Failed to send emails:', emailError);
    // Don't fail the request if email sending fails
  }

  res.status(201).json({
    status: 'success',
    message: 'Ticket created successfully',
    data: ticket
  });
}));

// ============================================================================
// STEP 3: MODIFY UPDATE TICKET ROUTE
// ============================================================================

// AFTER: With email and activity logging (track changes)
router.put('/:id', authMiddleware, canEditTicket, asyncHandler(async (req, res) => {
  const { title, description, priority, status, issueType } = req.body;

  // Verify ticket exists and get old data for comparison
  const { data: oldTicket, error: ticketError } = await supabase
    .from('bugs')
    .select(`
      *,
      project:project_id(id, name)
    `)
    .eq('id', req.params.id)
    .single();

  if (ticketError || !oldTicket) {
    return res.status(404).json({ status: 'error', message: 'Ticket not found' });
  }

  // ... (all existing validation code remains the same) ...

  const updateData = {};
  const changes = {}; // Track what changed

  if (title !== undefined) {
    updateData.title = title.trim();
    if (oldTicket.title !== updateData.title) changes.title = { old: oldTicket.title, new: updateData.title };
  }
  if (description !== undefined) {
    updateData.description = description?.trim() || null;
    if (oldTicket.description !== updateData.description) changes.description = 'Updated description';
  }
  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ status: 'error', message: 'Invalid priority' });
    }
    updateData.priority = priority;
    if (oldTicket.priority !== updateData.priority) changes.priority = { old: oldTicket.priority, new: updateData.priority };
  }
  if (status !== undefined) {
    const validStatuses = ['open', 'in-progress', 'in-review', 'closed', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }
    updateData.status = status;
    if (oldTicket.status !== updateData.status) changes.status = { old: oldTicket.status, new: updateData.status };
  }
  if (issueType !== undefined) {
    const validIssueTypes = ['bug', 'feature', 'task'];
    if (!validIssueTypes.includes(issueType)) {
      return res.status(400).json({ status: 'error', message: 'Invalid issue type' });
    }
    updateData.issue_type = issueType;
    if (oldTicket.issue_type !== updateData.issue_type) changes.issueType = { old: oldTicket.issue_type, new: updateData.issue_type };
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ status: 'error', message: 'No fields to update' });
  }

  const { data, error } = await supabase
    .from('bugs')
    .update(updateData)
    .eq('id', req.params.id)
    .select(`
      *,
      reporter:reporter_id(id, first_name, last_name, email, avatar_url),
      assignee:assignee_id(id, first_name, last_name, email, avatar_url)
    `);

  if (error) {
    return res.status(400).json({ status: 'error', message: error.message });
  }

  const ticket = data[0];

  // ===== NEW: Log Activity with Changes =====
  try {
    const changesSummary = Object.entries(changes)
      .map(([key, val]) => {
        if (typeof val === 'object') {
          return `${key}: ${val.old} → ${val.new}`;
        }
        return `${key}: ${val}`;
      })
      .join(', ');

    await activityService.logActivity({
      userId: req.userId,
      projectId: oldTicket.project_id,
      action: 'updated',
      entityType: 'ticket',
      entityId: ticket.id,
      details: `Updated ticket: ${ticket.title} (${changesSummary})`,
      changes: changes
    });
  } catch (activityError) {
    console.error('Failed to log activity:', activityError);
  }

  // ===== NEW: Send Emails to Watchers/Assignee =====
  try {
    const notifyUsers = new Set();
    
    // Notify original reporter
    if (oldTicket.reporter_id) notifyUsers.add(oldTicket.reporter_id);
    
    // Notify assignee
    if (oldTicket.assignee_id) notifyUsers.add(oldTicket.assignee_id);

    for (const userId of notifyUsers) {
      const shouldSend = await emailPreferenceService.shouldSendEmail(userId, 'ticket_updated');
      
      if (shouldSend) {
        const { data: user } = await supabase
          .from('users')
          .select('id, email, first_name, last_name')
          .eq('id', userId)
          .single();

        if (user?.email) {
          await emailService.sendTicketUpdatedEmail(user, ticket, changes);
        }
      }
    }
  } catch (emailError) {
    console.error('Failed to send emails:', emailError);
  }

  res.status(200).json({
    status: 'success',
    message: 'Ticket updated successfully',
    data: ticket
  });
}));

// ============================================================================
// STEP 4: MODIFY DELETE TICKET ROUTE
// ============================================================================

// AFTER: With email and activity logging
router.delete('/:id', authMiddleware, canDeleteTicket, asyncHandler(async (req, res) => {
  // Verify ticket exists and get data
  const { data: ticket, error: ticketError } = await supabase
    .from('bugs')
    .select(`
      *,
      project:project_id(id, name)
    `)
    .eq('id', req.params.id)
    .single();

  if (ticketError || !ticket) {
    return res.status(404).json({ status: 'error', message: 'Ticket not found' });
  }

  const { error } = await supabase
    .from('bugs')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    return res.status(400).json({ status: 'error', message: error.message });
  }

  // ===== NEW: Log Activity =====
  try {
    await activityService.logActivity({
      userId: req.userId,
      projectId: ticket.project_id,
      action: 'deleted',
      entityType: 'ticket',
      entityId: ticket.id,
      details: `Deleted ticket: ${ticket.title}`,
      changes: null
    });
  } catch (activityError) {
    console.error('Failed to log activity:', activityError);
  }

  res.status(200).json({
    status: 'success',
    message: 'Ticket deleted successfully'
  });
}));

// ============================================================================
// STEP 5: MODIFY ASSIGNMENT ROUTE
// ============================================================================

// AFTER: With email and activity logging
router.post('/:id/assign', authMiddleware, canAssignTicket, asyncHandler(async (req, res) => {
  const { assigneeId } = req.body;

  if (!assigneeId) {
    return res.status(400).json({ status: 'error', message: 'Assignee ID is required' });
  }

  // Get ticket and project info
  const { data: ticket, error: ticketError } = await supabase
    .from('bugs')
    .select(`
      *,
      project:project_id(id, name),
      assignee:assignee_id(id, first_name, last_name, email)
    `)
    .eq('id', req.params.id)
    .single();

  if (ticketError || !ticket) {
    return res.status(404).json({ status: 'error', message: 'Ticket not found' });
  }

  // Verify assignee is a member of the project
  const { data: isMember, error: memberError } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', ticket.project_id)
    .eq('user_id', assigneeId)
    .single();

  if (!isMember) {
    return res.status(403).json({ status: 'error', message: 'Assignee is not a member of this project' });
  }

  // Update assignment
  const { data, error } = await supabase
    .from('bugs')
    .update({ assignee_id: assigneeId })
    .eq('id', req.params.id)
    .select(`
      *,
      reporter:reporter_id(id, first_name, last_name, email, avatar_url),
      assignee:assignee_id(id, first_name, last_name, email, avatar_url)
    `);

  if (error) {
    return res.status(400).json({ status: 'error', message: error.message });
  }

  const updatedTicket = data[0];

  // ===== NEW: Log Activity =====
  try {
    const assigneeName = updatedTicket.assignee ? `${updatedTicket.assignee.first_name} ${updatedTicket.assignee.last_name}` : 'Unassigned';
    await activityService.logActivity({
      userId: req.userId,
      projectId: ticket.project_id,
      action: 'assigned',
      entityType: 'ticket',
      entityId: ticket.id,
      details: `Assigned ticket to ${assigneeName}: ${ticket.title}`,
      changes: {
        assignee: assigneeName
      }
    });
  } catch (activityError) {
    console.error('Failed to log activity:', activityError);
  }

  // ===== NEW: Send Email to Assignee =====
  try {
    const { data: assignee } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', assigneeId)
      .single();

    if (assignee?.email) {
      const shouldSend = await emailPreferenceService.shouldSendEmail(assigneeId, 'ticket_assigned');
      
      if (shouldSend) {
        await emailService.sendTicketAssignedEmail(
          assignee,
          updatedTicket,
          { id: ticket.project_id, name: ticket.project.name }
        );
      }
    }
  } catch (emailError) {
    console.error('Failed to send email:', emailError);
  }

  res.status(200).json({
    status: 'success',
    message: 'Ticket assigned successfully',
    data: updatedTicket
  });
}));

// ============================================================================
// STEP 6: COMMENT ROUTE INTEGRATION (in commentRoutes.js)
// ============================================================================

/*
Similarly, add to comment creation route:

import emailService from '../services/emailService.js';
import activityService from '../services/activityService.js';
import emailPreferenceService from '../services/emailPreferenceService.js';

// After creating comment:
await activityService.logActivity({
  userId: req.userId,
  projectId,
  action: 'commented',
  entityType: 'comment',
  entityId: comment.id,
  details: `Commented on ticket: ${ticket.title}`,
  changes: null
});

// Send emails to ticket watchers
const notifyUsers = [ticket.created_by, ticket.assigned_to].filter(Boolean);
for (const userId of notifyUsers) {
  const shouldSend = await emailPreferenceService.shouldSendEmail(userId, 'comment_added');
  if (shouldSend) {
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (user?.email) {
      await emailService.sendCommentEmail(user, comment, ticket, project);
    }
  }
}
*/

// ============================================================================
// TESTING THE INTEGRATION
// ============================================================================

/*
TEST CHECKLIST:

1. Test Create Ticket:
   - POST /bugs with valid data
   - Verify: Activity logged, emails sent to members with preference enabled

2. Test Update Ticket:
   - PUT /bugs/:id with status change
   - Verify: Activity logged with changes, emails sent to reporter/assignee

3. Test Delete Ticket:
   - DELETE /bugs/:id
   - Verify: Activity logged with deletion

4. Test Assign:
   - POST /bugs/:id/assign with assigneeId
   - Verify: Activity logged, email sent to new assignee

5. Test Email Preferences:
   - GET /user/email-preferences (should return defaults)
   - PUT /user/email-preferences with { ticket_created: false }
   - Create new ticket - no email should be sent

6. Test Activity Feed:
   - GET /projects/:projectId/activity - should show all activities
   - GET /tickets/:ticketId/activity - should show ticket-specific activities
   - Verify timestamps, user info, changes are correct

7. Test Email Preference Checks:
   - Verify emailPreferenceService.shouldSendEmail() prevents sending
   - Verify disabled preferences are respected
*/

export default router;
