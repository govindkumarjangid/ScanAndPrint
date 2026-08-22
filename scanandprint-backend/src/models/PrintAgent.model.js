import mongoose from 'mongoose'

const printAgentSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      unique: true,
      index: true,
    },
    socketId: {
      type: String,
      required: true,
      index: true,
    },
    agentVersion: {
      type: String,
      default: '1.0.3',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    osPlatform: {
      type: String,
      default: 'Windows',
    },
    deviceFingerprint: {
      type: String,
      default: '',
    },
    meta: {
      hostname: { type: String, default: '' },
      platform: { type: String, default: 'Windows' },
      cpuModel: { type: String, default: '' },
      motherboardSerial: { type: String, default: '' },
      systemUuid: { type: String, default: '' },
      totalMemoryGb: { type: Number, default: 0 },
      ipAddress: { type: String, default: '' },
      localIp: { type: String, default: '' },
      defaultGateway: { type: String, default: '' },
    },
    connectedPrinters: [
      {
        name: { type: String, trim: true },
        deviceId: { type: String, trim: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isConnected: {
      type: Boolean,
      default: true,
      index: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    disconnectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

printAgentSchema.index({ shopId: 1, isConnected: 1 })

export const PrintAgent = mongoose.model('PrintAgent', printAgentSchema)