import mongoose from 'mongoose'

const printJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    customerPhone: {
      type: String,
      default: '',
      trim: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      default: 0,
    },
    totalPages: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    colorType: {
      type: String,
      enum: ['BLACK_AND_WHITE', 'COLOR'],
      default: 'BLACK_AND_WHITE',
      index: true,
    },
    copies: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    isDuplex: {
      type: Boolean,
      default: false,
    },
    bwPages: {
      type: Number,
      default: 0,
    },
    colorPages: {
      type: Number,
      default: 0,
    },
    bwRateApplied: {
      type: Number,
      default: 5.0,
    },
    colorRateApplied: {
      type: Number,
      default: 10.0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentGateway: {
      type: String,
      enum: ['PHONEPE', 'RAZORPAY', 'PAYTM', 'MOCK'],
      default: 'PHONEPE',
    },
    paymentTxnId: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'PAYMENT_VERIFIED',
        'DISPATCHED_TO_AGENT',
        'PRINTED_SUCCESSFULLY',
        'PRINT_FAILED',
      ],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    printedPrinterName: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// High-Performance Compound Indexes for ultra-fast query execution
printJobSchema.index({ shopId: 1, status: 1, createdAt: -1 })
printJobSchema.index({ shopCode: 1, status: 1, createdAt: -1 })
printJobSchema.index({ paymentTxnId: 1 })

export const PrintJob = mongoose.model('PrintJob', printJobSchema)
