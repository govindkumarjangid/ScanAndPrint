import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
  demoMode: {
    type: Boolean,
    default: false
  },
  demoPagesLimit: {
    type: Number,
    default: 5
  },
  basePricePerPage: {
    type: Number,
    default: 5
  },
  convenienceFee: {
    type: Number,
    default: 2
  },
  monthlyPrice: {
    type: Number,
    default: 399
  },
  lifetimePrice: {
    type: Number,
    default: 599
  },
  supportEmail: {
    type: String,
    default: "scanqrandprint@gmail.com"
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  systemNotice: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model('AdminSettings', adminSettingsSchema);
