const { sendEmail } = require('../config/nodemailer');

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
Hello ${contactName},

Thank you for registering ${companyName} with OptiVault.

Your company registration has been received and is awaiting
review by the platform administrators.

Registration reference: ${reference}

Regards,
OptiVault Platform Team
`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>OptiVault Registration Received</h2>
            <p>Hello ${contactName},</p>
            <p>
                Thank you for registering <strong>${companyName}</strong>
                with OptiVault.
            </p>
            <p>
                Your company registration has been received and is
                awaiting review by the platform administrators.
            </p>
            <p>
                <strong>Registration reference:</strong> ${reference}
            </p>
            <p>Regards,<br>OptiVault Platform Team</p>
        </div>
    `;

    return sendEmail({
        to,
        subject,
        text,
        html
    });
};

module.exports = {
    sendRegistrationReceivedEmail
};
