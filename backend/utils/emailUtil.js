import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.response);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
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
