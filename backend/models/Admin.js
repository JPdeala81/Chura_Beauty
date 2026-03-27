import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  salonName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  whatsapp: { type: String },
  address: { type: String },
  bio: { type: String },
  profilePicture: { type: String },
  coverPicture: { type: String },
  socialLinks: {
    instagram: { type: String },
    facebook: { type: String },
  },
  paymentConfig: {
    airtelCode: { type: String, default: '' },
    moovCode: { type: String, default: '' },
    isPaymentEnabled: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save middleware for password hashing
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const bcrypt = (await import('bcryptjs')).default;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords
adminSchema.methods.matchPassword = async function (enteredPassword) {
  const bcrypt = (await import('bcryptjs')).default;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Admin', adminSchema);
