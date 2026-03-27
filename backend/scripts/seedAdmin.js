import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const admin = new Admin({
      salonName: process.env.SALON_NAME || 'Mon Salon de Beauté',
      ownerName: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      phone: process.env.ADMIN_PHONE || '+241666000000',
      whatsapp: process.env.ADMIN_WHATSAPP || '+241666000000',
      address: process.env.ADMIN_ADDRESS || '123 Rue du Salon',
      bio: 'Bienvenue dans notre salon de beauté',
      socialLinks: {
        instagram: process.env.ADMIN_INSTAGRAM || '',
        facebook: process.env.ADMIN_FACEBOOK || '',
      },
      paymentConfig: {
        airtelCode: '',
        moovCode: '',
        isPaymentEnabled: false,
      },
    });

    await admin.save();
    console.log('Admin created successfully:', admin.email);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
