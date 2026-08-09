import { z } from 'zod'

export const createJobSchema = z.object({
  shopCode: z.string().min(1, 'Shop Code is required'),
  customerPhone: z.string().optional(),
  originalFileName: z.string().min(1, 'File Name is required'),
  fileUrl: z.string().url('Valid file URL is required'),
  fileSizeBytes: z.number().optional(),
  totalPages: z.number().min(1, 'At least 1 page is required'),
  colorType: z.enum(['BLACK_AND_WHITE', 'COLOR']),
  copies: z.number().min(1).default(1),
  isDuplex: z.boolean().default(false),
})

export const verifyPaymentSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  paymentTxnId: z.string().optional(),
})
