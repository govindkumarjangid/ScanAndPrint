import { z } from 'zod'

export const createJobSchema = z.object({
  shopCode: z.string().min(1, 'Shop Code is required'),
  customerPhone: z.string().optional().default(''),
  originalFileName: z.string().optional(),
  fileUrl: z.string().optional(),
  fileSizeBytes: z.coerce.number().optional(),
  totalPages: z.coerce.number().min(1, 'At least 1 page is required').default(1),
  colorType: z.enum(['BLACK_AND_WHITE', 'COLOR']),
  copies: z.coerce.number().min(1).default(1),
  isDuplex: z.preprocess(
    (val) => val === true || val === 'true' || val === 1 || val === '1',
    z.boolean()
  ).default(false),
})

export const verifyPaymentSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  paymentTxnId: z.string().optional(),
})

