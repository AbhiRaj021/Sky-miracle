import * as z from 'zod'
import { emailSchema } from '@/features/auth/schemas'

export const RegisterFileSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  storagePath: z.string(),
})

export const RegisterVersionSchema = z.object({
  fileId: z.uuid(),
  storagePath: z.string(),
  changeSummary: z.string().trim().max(500).optional(),
})

export const ShareFormSchema = z.object({
  fileId: z.uuid(),
  email: emailSchema,
  permission: z.enum(['view', 'edit']),
})

export const RevokeShareSchema = z.object({
  fileId: z.uuid(),
  userId: z.uuid(),
})
