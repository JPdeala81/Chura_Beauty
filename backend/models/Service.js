import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  images: {
    type: [String],
    default: [],
  },
  mainImageIndex: {
    type: Number,
    default: 0,
  },
  displayStyle: {
    type: String,
    enum: ['full-width', 'card', 'featured'],
    default: 'card',
  },
  availability: [
    {
      dayOfWeek: String,
      startTime: String,
      endTime: String,
      isRecurring: Boolean,
    },
  ],
  specificDates: [
    {
      date: Date,
      startTime: String,
      endTime: String,
    },
  ],
  checkboxOptions: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Service', serviceSchema);
