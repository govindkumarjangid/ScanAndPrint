import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
  freeDemoMode: {
    type: Boolean,
    default: true
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
