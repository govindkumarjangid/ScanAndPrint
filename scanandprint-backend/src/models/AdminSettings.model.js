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
    default: 299
  },
  yearlyPrice: {
    type: Number,
    default: 799
  },
  supportEmail: {
    type: String,
    default: "scanqrandprint@gmail.com"
  },
  supportPhone: {
    type: String,
    default: "+91 98765 43210"
  },
  demoDurationHours: {
    type: Number,
    default: 2
  },
  filePurgeMinutes: {
    type: Number,
    default: 60
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
