import mongoose from 'mongoose'

const subscriptionPaymentSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    shopCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ['FREE_TRIAL', 'MONTHLY_399', 'LIFETIME_599'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      index: true,
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['CREATED', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'RAZORPAY',
    },
    activatedFrom: {
      type: Date,
      default: Date.now,
    },
    activatedUntil: {
      type: Date,
      default: null,
    },
    rawDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

subscriptionPaymentSchema.index({ shopCode: 1, createdAt: -1 })

export const SubscriptionPayment = mongoose.model('SubscriptionPayment', subscriptionPaymentSchema)
export default SubscriptionPayment
