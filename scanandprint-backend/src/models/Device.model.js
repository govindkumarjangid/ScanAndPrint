import mongoose from 'mongoose'

const deviceSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    fingerprint: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'REVOKED'],
      default: 'PENDING_APPROVAL',
      index: true,
    },
    meta: {
      hostname: { type: String, default: 'Unknown Host' },
      platform: { type: String, default: 'Windows' },
      osRelease: { type: String, default: '' },
      arch: { type: String, default: 'x64' },
      cpuModel: { type: String, default: 'Unknown CPU' },
      motherboardSerial: { type: String, default: 'Unknown' },
      systemUuid: { type: String, default: '' },
      totalMemoryGb: { type: Number, default: 0 },
      appVersion: { type: String, default: '1.0.3' },
      ipAddress: { type: String, default: '' },
      localIp: { type: String, default: '' },
      defaultGateway: { type: String, default: '' },
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastConnectedAt: {
      type: Date,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'SYSTEM', null],
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: String,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedBy: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Ensure one entry per physical device fingerprint per shop
deviceSchema.index({ shopId: 1, fingerprint: 1 }, { unique: true })
deviceSchema.index({ shopId: 1, status: 1 })
deviceSchema.index({ createdAt: -1 })

export const Device = mongoose.model('Device', deviceSchema)
