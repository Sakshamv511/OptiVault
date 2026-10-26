const { sendEmail } = require('../config/nodemailer');

/**
 * Send approval email to company admin
 */
const sendApprovalEmail = async ({ to, companyName, contactName, appUrl }) => {
  const base = process.env.FRONTEND_URL || appUrl || 'https://optivault-warehouse.vercel.app';
  const loginUrl = `${base.replace(/\/$/, '')}/signin.html?role=company-admin`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 30px; color: #1e1e1e; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e0d8; border-radius: 8px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        .header { border-bottom: 2px solid #e5e0d8; padding-bottom: 18px; margin-bottom: 24px; }
        .logo { font-size: 20px; font-weight: 700; letter-spacing: 0.1em; color: #1e1e1e; }
        .logo span { color: #d97736; }
        .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-size: 24px; margin: 0 0 16px; color: #1e1e1e; font-weight: 600; line-height: 1.3; }
        p { font-size: 15px; line-height: 1.6; color: #4a4a4a; margin: 0 0 16px; }
        .info-card { background: #faf9f6; border: 1px solid #ebe7df; border-radius: 6px; padding: 18px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .info-row:last-child { margin-bottom: 0; }
        .info-label { color: #787570; font-weight: 500; }
        .info-val { font-weight: 600; color: #1e1e1e; }
        .cta-btn { display: inline-block; background: #d97736; color: #ffffff !important; text-decoration: none; padding: 12px 26px; border-radius: 5px; font-weight: 600; font-size: 14px; letter-spacing: 0.05em; margin-top: 14px; }
        .footer { margin-top: 32px; padding-top: 18px; border-top: 1px solid #eee; font-size: 12px; color: #8e8b85; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OPTI<span>VAULT</span></div>
        </div>
        <span class="badge">Registration Approved</span>
        <h1>Welcome to OptiVault, ${companyName}!</h1>
        <p>Dear ${contactName || 'Team'},</p>
        <p>We are pleased to inform you that your registration for <strong>${companyName}</strong> has been reviewed and <strong>approved</strong> by the platform administration team.</p>
        
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Account Status:</span>
            <span class="info-val" style="color:#2e7d32">Active & Ready</span>
          </div>
          <div class="info-row">
            <span class="info-label">Registered Email:</span>
            <span class="info-val">${to}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Authorized Role:</span>
            <span class="info-val">Company Admin & Supervisors</span>
          </div>
        </div>

        <p>Your workspace is now live. You can sign in using your registered credentials to access your warehouse dashboard, request new facilities, and manage your inventory allocation.</p>

        <a href="${loginUrl}" class="cta-btn">SIGN IN TO WORKSPACE →</a>

        <div class="footer">
          <p>OptiVault Warehouse Management & Slot Allocation System.<br>If you did not make this request or have questions, contact us at admin@optivault.internal.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `[OptiVault] Registration Approved — ${companyName}`,
    html
  });
};

/**
 * Send rejection email to company applicant
 */
const sendRejectionEmail = async ({ to, companyName, contactName, reason }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 30px; color: #1e1e1e; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e0d8; border-radius: 8px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        .header { border-bottom: 2px solid #e5e0d8; padding-bottom: 18px; margin-bottom: 24px; }
        .logo { font-size: 20px; font-weight: 700; letter-spacing: 0.1em; color: #1e1e1e; }
        .logo span { color: #d97736; }
        .badge { display: inline-block; background: #ffebee; color: #c62828; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-size: 24px; margin: 0 0 16px; color: #1e1e1e; font-weight: 600; line-height: 1.3; }
        p { font-size: 15px; line-height: 1.6; color: #4a4a4a; margin: 0 0 16px; }
        .info-card { background: #faf9f6; border: 1px solid #ebe7df; border-radius: 6px; padding: 18px; margin: 20px 0; }
        .footer { margin-top: 32px; padding-top: 18px; border-top: 1px solid #eee; font-size: 12px; color: #8e8b85; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OPTI<span>VAULT</span></div>
        </div>
        <span class="badge">Application Declined</span>
        <h1>Registration Status Update</h1>
        <p>Dear ${contactName || 'Applicant'},</p>
        <p>Thank you for your interest in OptiVault. After review by our platform administration team, we regret to inform you that your company registration for <strong>${companyName}</strong> could not be approved at this time.</p>
        
        <div class="info-card">
          <p style="margin: 0; font-size: 14px; color: #555;">
            <strong>Decision note:</strong> ${reason || 'The application did not satisfy our verification criteria or facility profile requirements.'}
          </p>
        </div>

        <p>If you believe this was an error or would like to submit updated company information, please reach out directly to our platform support team.</p>

        <div class="footer">
          <p>OptiVault Administration · admin@optivault.internal<br>This is an automated notification sent via OptiVault SMTP service.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `[OptiVault] Registration Status Update — ${companyName}`,
    html
  });
};

/**
 * Send registration received confirmation
 */
const sendRegistrationReceivedEmail = async ({ to, companyName, contactName, reference }) => {
  const siteUrl = process.env.FRONTEND_URL || 'https://optivault-warehouse.vercel.app';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 30px; color: #1e1e1e; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e0d8; border-radius: 8px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        .header { border-bottom: 2px solid #e5e0d8; padding-bottom: 18px; margin-bottom: 24px; }
        .logo { font-size: 20px; font-weight: 700; letter-spacing: 0.1em; color: #1e1e1e; }
        .logo span { color: #d97736; }
        .badge { display: inline-block; background: #fff8e1; color: #b78103; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-size: 22px; margin: 0 0 16px; color: #1e1e1e; font-weight: 600; line-height: 1.3; }
        p { font-size: 15px; line-height: 1.6; color: #4a4a4a; margin: 0 0 16px; }
        .ref-box { background: #faf9f6; border: 1px dashed #d97736; border-radius: 6px; padding: 14px; text-align: center; margin: 20px 0; font-family: monospace; font-size: 16px; font-weight: 700; color: #d97736; }
        .cta-btn { display: inline-block; background: #1e1e1e; color: #ffffff !important; text-decoration: none; padding: 11px 22px; border-radius: 5px; font-weight: 600; font-size: 13px; letter-spacing: 0.04em; }
        .footer { margin-top: 32px; padding-top: 18px; border-top: 1px solid #eee; font-size: 12px; color: #8e8b85; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OPTI<span>VAULT</span></div>
        </div>
        <span class="badge">Under Review</span>
        <h1>Registration Received</h1>
        <p>Dear ${contactName || 'Team'},</p>
        <p>We have successfully received your company registration for <strong>${companyName}</strong>.</p>
        <p>Your registration reference number is:</p>
        <div class="ref-box">${reference}</div>
        <p>Our platform administrators review each registration within 2 working days to verify facility specifications and set up the slot allocation profile. You will receive an email once the decision has been made.</p>
        
        <p style="margin-top: 22px; text-align: center;">
          <a href="${siteUrl}" class="cta-btn">VISIT OPTIVAULT PORTAL →</a>
        </p>

        <div class="footer">
          <p>OptiVault Platform: <a href="${siteUrl}" style="color:#d97736;">${siteUrl}</a><br>OptiVault Administration · admin@optivault.internal</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `[OptiVault] Registration Received — ${reference}`,
    html
  });
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
  sendRegistrationReceivedEmail
};