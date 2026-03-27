import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendWhatsAppMessage = async (toNumber, message) => {
  try {
    const cleanNumber = toNumber.replace(/\D/g, '');
    const result = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:+${cleanNumber}`,
      body: message,
    });

    console.log('WhatsApp message sent:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

export const sendWhatsAppTemplate = async (toNumber, templateName, templateData) => {
  try {
    const cleanNumber = toNumber.replace(/\D/g, '');
    const result = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:+${cleanNumber}`,
      contentSid: process.env[`TWILIO_TEMPLATE_${templateName.toUpperCase()}`],
      contentVariables: JSON.stringify(templateData),
    });

    console.log('WhatsApp template sent:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp template:', error);
    throw error;
  }
};
