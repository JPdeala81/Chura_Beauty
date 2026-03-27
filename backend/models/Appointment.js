import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientPhone: {
    type: String,
    required: true,
  },
  clientWhatsapp: {
    type: String,
    required: true,
  },
  desiredDate: {
    type: Date,
    required: true,
  },
  desiredTimeSlot: {
    start: String,
    end: String,
  },
  selectedOptions: {
    type: [String],
    default: [],
  },
  customDescription: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'refused'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  revenue: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Appointment', appointmentSchema);
