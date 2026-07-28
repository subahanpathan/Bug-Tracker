// Email service using SendGrid
import sgMail from '@sendgrid/mail';

const isEmailConfigured = Boolean(
  process.env.SENDGRID_API_KEY &&
  typeof process.env.SENDGRID_API_KEY === 'string' &&
  process.env.SENDGRID_API_KEY.startsWith('SG.')
);

if (isEmailConfigured) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('⚠️ SENDGRID_API_KEY is missing or invalid (must start with "SG."). Email service disabled.');
}

export const emailTemplates = {
  TICKET_CREATED: {
    subject: 'New Ticket Created: {ticketTitle}',
    templateId: process.env.SENDGRID_TICKET_CREATED_TEMPLATE,
  },
  TICKET_ASSIGNED: {
    subject: 'Ticket Assigned to You: {ticketTitle}',
    templateId: process.env.SENDGRID_TICKET_ASSIGNED_TEMPLATE,
  },
  TICKET_UPDATED: {
    subject: 'Ticket Updated: {ticketTitle}',
    templateId: process.env.SENDGRID_TICKET_UPDATED_TEMPLATE,
  },
  COMMENT_ADDED: {
    subject: 'New Comment on: {ticketTitle}',
    templateId: process.env.SENDGRID_COMMENT_TEMPLATE,
  },
  TEAM_INVITATION: {
    subject: 'Invited to Project: {projectName}',
    templateId: process.env.SENDGRID_INVITATION_TEMPLATE,
  },
};

class EmailService {
  async sendEmail(to, templateId, templateData) {
    if (!isEmailConfigured) {
      console.log(`[EMAIL DISABLED] Skip sending email to ${to}`);
      return { success: false, disabled: true };
    }

    try {
      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@bugtracker.app',
        templateId,
        dynamicTemplateData: templateData,
      };

      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('SendGrid error:', error?.message || error);
      if (error.response) {
        console.error(error.response.body);
      }
      return { success: false, error: error?.message || 'Email failed' };
    }
  }

  async sendTicketCreatedEmail(user, ticket, projectName) {
    const templateData = {
      ticketTitle: ticket.title,
      ticketId: ticket.id,
      projectName,
      ticketDescription: ticket.description,
      priority: ticket.priority,
      ticketUrl: `${process.env.FRONTEND_URL}/ticket/${ticket.id}`,
    };

    return this.sendEmail(
      user.email,
      emailTemplates.TICKET_CREATED.templateId,
      templateData
    );
  }

  async sendTicketAssignedEmail(user, ticket, projectName, assignedBy) {
    const templateData = {
      ticketTitle: ticket.title,
      ticketId: ticket.id,
      projectName,
      assignedBy: assignedBy.first_name,
      priority: ticket.priority,
      ticketUrl: `${process.env.FRONTEND_URL}/ticket/${ticket.id}`,
    };

    return this.sendEmail(
      user.email,
      emailTemplates.TICKET_ASSIGNED.templateId,
      templateData
    );
  }

  async sendTicketUpdatedEmail(user, ticket, projectName, updatedBy, changes) {
    const templateData = {
      ticketTitle: ticket.title,
      ticketId: ticket.id,
      projectName,
      updatedBy: updatedBy.first_name,
      changes: Object.entries(changes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', '),
      ticketUrl: `${process.env.FRONTEND_URL}/ticket/${ticket.id}`,
    };

    return this.sendEmail(
      user.email,
      emailTemplates.TICKET_UPDATED.templateId,
      templateData
    );
  }

  async sendCommentEmail(user, ticket, projectName, commentedBy, comment) {
    const templateData = {
      ticketTitle: ticket.title,
      ticketId: ticket.id,
      projectName,
      commentedBy: commentedBy.first_name,
      comment: comment.substring(0, 500), // First 500 chars
      ticketUrl: `${process.env.FRONTEND_URL}/ticket/${ticket.id}`,
    };

    return this.sendEmail(
      user.email,
      emailTemplates.COMMENT_ADDED.templateId,
      templateData
    );
  }

  async sendTeamInvitationEmail(user, projectName, invitedBy, acceptUrl) {
    const templateData = {
      projectName,
      invitedBy: invitedBy.first_name,
      userFirstName: user.first_name,
      acceptUrl,
      frontendUrl: process.env.FRONTEND_URL,
    };

    return this.sendEmail(
      user.email,
      emailTemplates.TEAM_INVITATION.templateId,
      templateData
    );
  }

  async sendBulkEmail(recipients, templateId, templateData) {
    if (!isEmailConfigured) {
      console.log(`[EMAIL DISABLED] Skip bulk sending to ${recipients.length} recipients`);
      return { success: false, disabled: true };
    }

    try {
      await sgMail.sendMultiple({
        to: recipients,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@bugtracker.app',
        templateId,
        dynamicTemplateData: templateData,
      });

      console.log(`Bulk email sent to ${recipients.length} recipients`);
      return { success: true, sent: recipients.length };
    } catch (error) {
      console.error('SendGrid bulk error:', error?.message || error);
      return { success: false, error: error?.message || 'Bulk email failed' };
    }
  }
}

export default new EmailService();
