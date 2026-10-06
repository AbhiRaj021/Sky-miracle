import * as z from 'zod'

export const RoleFormSchema = z.object({
  userId: z.uuid(),
  role: z.enum(['admin', 'editor', 'viewer']),
})
