import QRCode from 'qrcode';

export const generateQRCode = (text) => {
  return QRCode.toDataURL(text);
};

export const generatePaymentQRCode = (amount, phoneNumber) => {
  const code = `tel:*555*1*${phoneNumber}*${amount}%23`;
  return generateQRCode(code);
};
