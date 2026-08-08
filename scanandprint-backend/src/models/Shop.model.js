import mongoose from 'mongoose'

const shopSchema = new mongoose.Schema(
  {
    shopCode: {
      type: String,
      required: [true, 'Shop Code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    shopName: {
      type: String,
      required: [true, 'Shop Name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Exclude password from query results by default
    },
    secretApiKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Shop address is required'],
      trim: true,
    },
    pincode: {
      type: String,
      default: '',
      trim: true,
    },
    cityState: {
      type: String,
      default: '',
      trim: true,
    },
    bwRate: {
      type: Number,
      required: true,
      default: 5.0,
      min: [0.5, 'B&W Rate must be at least ₹0.5'],
    },
    colorRate: {
      type: Number,
      required: true,
      default: 10.0,
      min: [1.0, 'Color Rate must be at least ₹1.0'],
    },
    printerBrand: {
      type: String,
      default: 'Epson',
      trim: true,
    },
    defaultBwPrinter: {
      type: String,
      default: '',
    },
    defaultColorPrinter: {
      type: String,
      default: '',
    },
    planType: {
      type: String,
      enum: ['FREE_TRIAL', 'MONTHLY_399', 'LIFETIME_599'],
      default: 'MONTHLY_399',
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastHeartbeatAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// High-Performance Compound Indexes for ultra-fast query execution
shopSchema.index({ shopCode: 1, secretApiKey: 1 })
shopSchema.index({ isOnline: 1, updatedAt: -1 })

export const Shop = mongoose.model('Shop', shopSchema)
