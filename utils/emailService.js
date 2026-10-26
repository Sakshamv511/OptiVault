const { sendEmail } = require('../config/nodemailer');

const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);

const sendRegistrationReceivedEmail = async ({
    to,
    companyName,
    contactName,
    reference
}) => {
    if (!to) {
        throw new Error('Recipient email is required');
    }

    const subject = 'OptiVault Registration Received';

    const text = `
Hello ${contactName || 'there'},

Your registration for ${companyName || 'your company'} has been received.
Your application is awaiting review by the platform administrators.

Registration reference: ${reference || 'Not provided'}

Regards,
OptiVault Platform Team
`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>OptiVault Registration Received</h2>
            <p>Hello ${escapeHtml(contactName || 'there')},</p>
            <p>
                Your registration for
                <strong>${escapeHtml(companyName || 'your company')}</strong>
                has been received.
            </p>
            <p>
                Your application is awaiting review by the
                platform administrators.
            </p>
            <p>
                <strong>Registration reference:</strong>
                ${escapeHtml(reference || 'Not provided')}
            </p>
            <p>Regards,<br>OptiVault Platform Team</p>
        </div>
    `;

    return sendEmail({ to, subject, text, html });
};

module.exports = { sendRegistrationReceivedEmail };