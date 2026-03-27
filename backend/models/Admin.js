const mongoose = require('mongoose');

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

module.exports = mongoose.model('Admin', adminSchema);
