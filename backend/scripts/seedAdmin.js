import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Try to connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected!');

    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin.email);
      process.exit(0);
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
    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔐 Password: Check .env file (ADMIN_PASSWORD)');
    process.exit(0);
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.log('\n📝 Creating admin credentials file instead...');
    
    // CREATE A FALLBACK CREDENTIALS FILE FOR TESTING
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'admin@salon.com',
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      salonName: process.env.SALON_NAME || 'Mon Salon de Beauté',
      ownerName: process.env.ADMIN_NAME || 'Admin',
      status: 'MOCK_ADMIN - MongoDB not connected. Use these credentials when MongoDB is set up.',
      createdAt: new Date().toISOString(),
    };

    const credentialsPath = path.resolve('./admin-credentials.json');
    fs.writeFileSync(credentialsPath, JSON.stringify(adminData, null, 2));
    
    console.log('✅ Admin credentials saved to: admin-credentials.json');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('\n⚠️  NOTE: To sync with MongoDB, update MONGODB_URI in .env');
    console.log('   Format: mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/salon_beaute');
    process.exit(0);
  }
};

seedAdmin();
