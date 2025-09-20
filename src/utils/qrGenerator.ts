import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCodeUrl = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};