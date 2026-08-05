const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const sendNotificationEmail = async ({ recipient, repair, type, message, trackingUrl }) => {
  try {
    const fromName = process.env.FROM_NAME || 'Local Repair Shop';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@repairshop.com';
    const subject = `[${type}] Repair Ticket #${repair.repairId} - ${repair.device.brand} ${repair.device.model}`;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div style="background: #1e293b; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">${fromName}</h2>
          <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">Digital Job Tracking Portal</p>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p style="font-size: 16px; font-weight: 600;">Hello ${recipient.name},</p>
          <p>${message}</p>
          
          <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Repair Summary:</p>
            <p style="margin: 4px 0;"><strong>Job ID:</strong> ${repair.repairId}</p>
            <p style="margin: 4px 0;"><strong>Device:</strong> ${repair.device.brand} ${repair.device.model} (${repair.device.type})</p>
            <p style="margin: 4px 0;"><strong>Current Status:</strong> <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${repair.status}</span></p>
            <p style="margin: 4px 0;"><strong>Estimated Cost:</strong> ₹${repair.finalCost || repair.estimatedCost || 0}</p>
          </div>

          ${
            trackingUrl
              ? `<div style="text-align: center; margin: 28px 0;">
                  <a href="${trackingUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Track Your Repair Status Live</a>
                </div>`
              : ''
          }
          
          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">If you have any questions, reply to this email or call our shop directly.</p>
        </div>
        <div style="background: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
          &copy; ${new Date().getFullYear()} ${fromName}. All rights reserved.
        </div>
      </div>
    `;

    let status = 'mocked';

    if (transporter) {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipient.email,
        subject,
        html,
      });
      status = 'sent';
      console.log(`[Email Sent]: To ${recipient.email} for ticket ${repair.repairId}`);
    } else {
      console.log(`[Email Mock Logged]: (Set SMTP env variables to send real emails)`);
      console.log(`  To: ${recipient.email}`);
      console.log(`  Subject: ${subject}`);
    }

    // Save notification history in DB
    await Notification.create({
      recipient: { name: recipient.name, email: recipient.email, phone: recipient.phone || '' },
      repair: repair._id,
      type,
      message,
      status,
    });

    return true;
  } catch (error) {
    console.error(`[Email Service Error]:`, error.message);
    return false;
  }
};

module.exports = {
  sendNotificationEmail,
};
