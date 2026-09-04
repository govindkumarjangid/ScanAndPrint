import { z } from 'zod'

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  shopName: z.string().min(2, 'Shop Name is required'),
  shopAddress: z.string().min(5, 'Shop Address is required'),
  pincode: z.string().optional(),
  cityState: z.string().optional(),
  printerBrand: z.string().optional(),
  bwRate: z.coerce.number().min(0.5).optional(),
  colorRate: z.coerce.number().min(1).optional(),
  planType: z.enum(['FREE_TRIAL', 'MONTHLY_299', 'YEARLY_799']).optional(),
  hardwareReady: z.boolean().optional(),
  printType: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().min(1, 'Email or Mobile Number is required'),
  password: z.string().min(1, 'Password is required'),
})

export const updateRatesSchema = z.object({
  bwRate: z.coerce.number().min(0.5, 'Must be at least 0.5'),
  colorRate: z.coerce.number().min(1, 'Must be at least 1.0'),
  pricingSettings: z.any().optional(),
})

export const updatePrintersSchema = z.object({
  defaultBwPrinter: z.string().optional(),
  defaultColorPrinter: z.string().optional(),
  printerBrand: z.string().optional(),
})
