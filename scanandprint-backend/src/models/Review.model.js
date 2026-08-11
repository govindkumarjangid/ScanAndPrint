import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  username: {
    type: String,
    trim: true,
    required: true
  },
  state: {
    type: String,
    trim: true,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    between: {
      min: 1,
      max: 5
    },
  },
  review: {
    type: String,
    trim: true,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);