import nodemailer from 'nodemailer';

let transporter = null;

// Initialize transporter based on available config
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // Gmail configuration
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log('✅ Email transporter initialized with Gmail');
  } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Custom SMTP configuration
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('✅ Email transporter initialized with SMTP');
  } else {
    console.warn('⚠️ Email service not configured - no EMAIL or SMTP variables found');
  }
} catch (err) {
  console.error('❌ Error initializing email transporter:', err.message);
}

export const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.error('❌ Email transporter not initialized');
    throw new Error('Service email non configuré. Vérifiez les variables d\'environnement EMAIL_USER/EMAIL_PASSWORD ou SMTP_*');
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SMTP_FROM,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', result.messageId || result.response);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
};

export const sendAppointmentConfirmationEmail = async (
  email,
  clientName,
  serviceName,
  appointmentDate,
  appointmentTime
) => {
  const html = `
    <h2>Confirmation de rendez-vous</h2>
    <p>Bonjour ${clientName},</p>
    <p>Votre rendez-vous pour <strong>${serviceName}</strong> a été confirmé.</p>
    <p><strong>Date :</strong> ${appointmentDate}</p>
    <p><strong>Heure :</strong> ${appointmentTime}</p>
    <p>À bientôt !</p>
  `;

  return sendEmail(email, 'Confirmation de rendez-vous', html);
};
