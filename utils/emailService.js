const { sendEmail: sendViaNodemailer } = require('../config/nodemailer');

/**
 * Sends transactional email using SendGrid's HTTPS API,
 * with fallback to Nodemailer (SMTP / Ethereal) for local testing.
 */
const sendMail = async ({ to, subject, html }) => {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'optivault601@gmail.com';
  const senderName = process.env.EMAIL_SENDER_NAME || 'OptiVault Platform';
  const recipients = Array.isArray(to) ? to : [String(to).trim()];

  // 1. Send via SendGrid HTTPS API (Works on Render, sends to ANY email worldwide)
  if (sendgridApiKey) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: recipients.map(email => ({ email: String(email).trim() }))
            }
          ],
          from: {
            email: fromEmail,
            name: senderName
          },
          subject,
          content: [
            {
              type: 'text/html',
              value: html
            }
          ]
        })
      });

      if (response.status === 202 || response.ok) {
        console.log(`[Email Delivered via SendGrid] To: ${recipients.join(', ')} | Status: 202 Accepted`);
        return {
          success: true,
          messageId: `sendgrid-${Date.now()}`
        };
      } else {
        const errText = await response.text();
        console.warn(`[SendGrid Warning] ${response.status}: ${errText}. Attempting fallback...`);
      }
    } catch (sgErr) {
      console.warn(`[SendGrid Error] ${sgErr.message}. Attempting fallback...`);
    }
  }

  // 2. Fallback to Nodemailer (Gmail SMTP or Ethereal test mailer)
  try {
    const toAddress = recipients.join(', ');
    const result = await sendViaNodemailer({
      to: toAddress,
      subject,
      html
    });

    return {
      success: true,
      previewUrl: result.previewUrl || null,
      messageId: result.info && result.info.messageId ? result.info.messageId : null
    };
  } catch (nodemailerError) {
    console.error(`[Email Error] Failed to send email to ${recipients.join(', ')}: ${nodemailerError.message}`);
    return {
      success: false,
      error: nodemailerError.message
    };
  }
};
/**
 * 1. Send Registration Received Confirmation (called in authController.js)
 */
const sendRegistrationReceivedEmail = async ({ to, companyName, contactName, reference }) => {
  const siteUrl = process.env.FRONTEND_URL || 'https://optivault-warehouse.vercel.app';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; padding: 30px; color: #f8fafc;">
      <div style="max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 8px; padding: 30px; border: 1px solid #334155;">
        <h2 style="color: #38bdf8; margin-top: 0;">OptiVault Application Received</h2>
        <p>Hello <strong>${contactName || 'Team'}</strong>,</p>
        <p>We received your registration request for <strong>${companyName}</strong>.</p>
        <div style="background: #0f172a; border-left: 4px solid #38bdf8; padding: 12px 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">Tracking Reference ID:</p>
          <p style="margin: 5px 0 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #38bdf8;">${reference}</p>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">Our Platform Administration team will review your warehouse profile. You will receive an email as soon as your account is approved.</p>
        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #334155; font-size: 12px; color: #64748b;">
          OptiVault B2B Automated Notification
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to,
    subject: `[OptiVault] Registration Received — ${reference}`,
    html
  });
};

/**
 * 2. Send Approval Email (called in adminController.js)
 */
const sendApprovalEmail = async ({ to, companyName, contactName, appUrl }) => {
  const base = process.env.FRONTEND_URL || appUrl || 'https://optivault-warehouse.vercel.app';
  const loginUrl = `${base.replace(/\/$/, '')}/signin.html?role=company-admin`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; padding: 30px; color: #f8fafc;">
      <div style="max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 8px; padding: 30px; border: 1px solid #334155;">
        <span style="background: #065f46; color: #34d399; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">Approved</span>
        <h2 style="color: #ffffff; margin-top: 12px;">Welcome to OptiVault, ${companyName}!</h2>
        <p>Dear ${contactName || 'Team'},</p>
        <p>Your registration for <strong>${companyName}</strong> has been reviewed and <strong>approved</strong> by the platform admin team.</p>
        <p>Your company workspace is active. You can now log in to manage your warehouse facilities and 2D slot inventory.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background: #38bdf8; color: #0f172a; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block;">Log In to Company Workspace →</a>
        </div>
        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #334155; font-size: 12px; color: #64748b;">
          OptiVault Warehouse Optimization System
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to,
    subject: `[OptiVault] Account Approved — ${companyName}`,
    html
  });
};

/**
 * 3. Send Rejection Email (called in adminController.js)
 */
const sendRejectionEmail = async ({ to, companyName, contactName, reason }) => {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; padding: 30px; color: #f8fafc;">
      <div style="max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 8px; padding: 30px; border: 1px solid #334155;">
        <span style="background: #7f1d1d; color: #fca5a5; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">Status Update</span>
        <h2 style="color: #ffffff; margin-top: 12px;">Registration Update for ${companyName}</h2>
        <p>Dear ${contactName || 'Applicant'},</p>
        <p>Thank you for your interest in OptiVault. After review, we regret to inform you that your registration could not be approved at this time.</p>
        <div style="background: #0f172a; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0; font-size: 13px; color: #cbd5e1;">
          <strong>Review Note:</strong> ${reason || 'Application criteria requirements were not met.'}
        </div>
        <p style="font-size: 13px; color: #94a3b8;">If you believe this was in error, please reach out to admin support.</p>
        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #334155; font-size: 12px; color: #64748b;">
          OptiVault Platform Administration
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to,
    subject: `[OptiVault] Application Status Update — ${companyName}`,
    html
  });
};

module.exports = {
  sendRegistrationReceivedEmail,
  sendApprovalEmail,
  sendRejectionEmail
};