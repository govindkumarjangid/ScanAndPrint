import mongoose from 'mongoose'

const printAgentSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    socketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    agentVersion: {
      type: String,
      default: '1.0.0',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    osPlatform: {
      type: String,
      default: 'win32',
    },
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