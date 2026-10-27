const { sendEmail: sendViaNodemailer } = require('../config/nodemailer');

/**
 * Sends email using Resend, Brevo, or falls back to Nodemailer (SMTP / Ethereal).
 */
const sendMail = async ({ to, subject, html }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.EMAIL_SENDER_NAME || process.env.BREVO_SENDER_NAME || 'OptiVault Platform';

  // 1. Try Resend if configured (HTTPS - zero port issues on Render, instant activation)
  if (resendApiKey) {
    try {
      const fromAddress = process.env.RESEND_FROM || `${senderName} <onboarding@resend.dev>`;
      const recipients = Array.isArray(to) ? to : [String(to).trim()];

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: recipients,
          subject,
          html
        })
      });

      const resData = await res.json();
      if (res.ok && resData.id) {
        console.log(`[Email Accepted] Resend sent email to ${recipients.join(', ')} | ID: ${resData.id}`);
        return { success: true, messageId: resData.id };
      } else {
        console.warn(`[Resend Error] ${resData.message || 'Sending failed'}`);
      }
    } catch (resendErr) {
      console.warn(`[Resend Error] ${resendErr.message}`);
    }
  }

  // 2. Try Brevo HTTPS API if configured
  if (brevoApiKey && brevoSenderEmail) {
    try {
      const recipients = Array.isArray(to)
        ? to.map((email) => typeof email === 'string' ? { email } : email)
        : [{ email: String(to).trim() }];

      const response = await fetch(
        'https://api.brevo.com/v3/smtp/email',
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: {
              name: senderName,
              email: brevoSenderEmail
            },
            to: recipients,
            subject,
            htmlContent: html
          })
        }
      );

      const responseText = await response.text();
      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(
          `Brevo API error ${response.status}: ${
            result.message || result.code || 'Request failed'
          }`
        );
      }

      console.log(
        `[Email Accepted] Brevo accepted email to ${recipients
          .map((recipient) => recipient.email)
          .join(', ')} | MessageId: ${result.messageId || 'not returned'}`
      );

      return {
        success: true,
        messageId: result.messageId || null
      };
    } catch (error) {
      console.error(`[Brevo Email Error] ${error.message}. Attempting Nodemailer fallback...`);
    }
  }

  // 2. Fallback to Nodemailer (Gmail SMTP or Ethereal test mailer)
  try {
    const toAddress = Array.isArray(to) ? to.join(', ') : String(to).trim();
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
    console.error(`[Email Error] Failed to send email to ${to}: ${nodemailerError.message}`);
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