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
      select: false,
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
    pricingSettings: {
      advanceFeaturesEnabled: { type: Boolean, default: false },
      documentPrintEnabled: { type: Boolean, default: true },
      resumeEnabled: { type: Boolean, default: false },
      photoSheetEnabled: { type: Boolean, default: false },
      bigSizeEnabled: { type: Boolean, default: false },
      miniPrintEnabled: { type: Boolean, default: false },
      duplexEnabled: { type: Boolean, default: false },
      duplexExtraRate: { type: Number, default: 0 },

      pageRangePricing: {
        enabled: { type: Boolean, default: false },
        bwRanges: [
          {
            fromPage: { type: Number, required: true },
            toPage: { type: Number, required: true },
            ratePerPage: { type: Number, required: true },
          },
        ],
        colorRanges: [
          {
            fromPage: { type: Number, required: true },
            toPage: { type: Number, required: true },
            ratePerPage: { type: Number, required: true },
          },
        ],
      },

      bigSizePricing: {
        a3: {
          bwRate: { type: Number, default: 0 },
          colorRate: { type: Number, default: 0 },
        },
        a2: {
          bwRate: { type: Number, default: 0 },
          colorRate: { type: Number, default: 0 },
        },
        a1: {
          bwRate: { type: Number, default: 0 },
          colorRate: { type: Number, default: 0 },
        },
      },

      photoSheetPricing: {
        rates: {
          type: mongoose.Schema.Types.Mixed,
          default: {
            p16: 0,
            p24: 0,
            p36: 0,
            p48: 0,
          },
        },
      },

      resumePricing: {
        bwRate: { type: Number, default: 0 },
        colorRate: { type: Number, default: 0 },
      },
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
    connectedPrinters: [
      {
        name: { type: String, trim: true },
        deviceId: { type: String, trim: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    planType: {
      type: String,
      enum: ['FREE_TRIAL', 'MONTHLY_299', 'YEARLY_799'],
      default: 'MONTHLY_299',
    },
    subscriptionStatus: {
      type: String,
      enum: ['PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    isSubscriptionActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastPaymentId: {
      type: String,
      default: '',
    },
    lastOrderId: {
      type: String,
      default: '',
    },
    isDemoAccount: {
      type: Boolean,
      default: false,
      index: true,
    },
    demoExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    paymentSettings: {
      paymentMode: { type: String, default: 'counter' },
      paymentGateway: { type: String, default: 'razorpay' },
      razorpayKeyId: { type: String, default: '' },
      razorpayKeySecret: { type: String, default: '' }, // bcrypt hashed
      isRazorpayConfigured: { type: Boolean, default: false },
    },
    reviews: [
      {
        username: String,
        state: String,
        stars: Number,
        review: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastHeartbeatAt: {
      type: Date,
      default: null,
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

shopSchema.index({ shopCode: 1, secretApiKey: 1 })
shopSchema.index({ isOnline: 1, updatedAt: -1 })

export const Shop = mongoose.model('Shop', shopSchema)
