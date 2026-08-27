import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
  demoMode: {
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
  monthlyPrice: {
    type: Number,
    default: 299
  },
  monthlyOriginalPrice: {
    type: Number,
    default: 499
  },
  yearlyPrice: {
    type: Number,
    default: 799
  },
  yearlyOriginalPrice: {
    type: Number,
    default: 3588
  },
  supportEmail: {
    type: String,
    default: "scanqrandprint@gmail.com"
  },
  supportPhone: {
    type: String,
    default: "+91 7073904473"
  },
  supportAddress: {
    type: String,
    default: "Tonk Road, Near University Campus, Jaipur, Rajasthan 302015"
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
