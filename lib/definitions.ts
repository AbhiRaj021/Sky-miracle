import * as z from 'zod'

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
  .regex(/[0-9]/, { message: 'Contain at least one number.' })
  .regex(/[^a-zA-Z0-9]/, {
    message: 'Contain at least one special character.',
  })

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'Please enter a valid email.' }))

const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Name must be at least 2 characters long.' })
  .max(100, { message: 'Name must be at most 100 characters long.' })

export const SignupFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const LoginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
})

export const ForgotPasswordFormSchema = z.object({
  email: emailSchema,
})

export const UpdatePasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const ProfileFormSchema = z.object({
  name: nameSchema,
})

export const ShareFormSchema = z.object({
  fileId: z.uuid(),
  email: emailSchema,
  permission: z.enum(['view', 'edit']),
})

export const RoleFormSchema = z.object({
  userId: z.uuid(),
  role: z.enum(['admin', 'editor', 'viewer']),
})

export const RegisterFileSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  storagePath: z.string(),
})

export const RegisterVersionSchema = z.object({
  fileId: z.uuid(),
  storagePath: z.string(),
  changeSummary: z.string().trim().max(500).optional(),
})

export type FormState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        confirmPassword?: string[]
        permission?: string[]
        role?: string[]
      }
      message?: string
      success?: boolean
    }
  | undefined

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }
