import twilio from 'twilio';

// Initialiser Twilio seulement si des credentials valides sont fournis
let client = null;

const initTwilio = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'placeholder' &&
      process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_AUTH_TOKEN !== 'placeholder') {
    try {
      client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('✅ Twilio initialisé');
    } catch (error) {
      console.warn('⚠️ Twilio non disponible (credentials invalides)');
    }
  } else {
    console.warn('⚠️ Twilio non configuré (placeholder detected)');
  }
};

initTwilio();

export const sendWhatsAppMessage = async (toNumber, message) => {
  try {
    if (!client) {
      console.warn('⚠️ Twilio non disponible - message WhatsApp non envoyé');
      return { sid: 'mock-id', status: 'skipped' };
    }
    
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
    if (!client) {
      console.warn('⚠️ Twilio non disponible - message WhatsApp template non envoyé');
      return { sid: 'mock-id', status: 'skipped' };
    }
    
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
