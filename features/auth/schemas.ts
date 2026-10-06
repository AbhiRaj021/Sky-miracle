import * as z from 'zod'

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'Please enter a valid email.' }))

const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Name must be at least 2 characters long.' })
  .max(100, { message: 'Name must be at most 100 characters long.' })

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
  .regex(/[0-9]/, { message: 'Contain at least one number.' })
  .regex(/[^a-zA-Z0-9]/, { message: 'Contain at least one special character.' })

const confirmPasswordsMatch = {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
}

export const SignupFormSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, confirmPasswordsMatch)

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
  .refine((data) => data.password === data.confirmPassword, confirmPasswordsMatch)

export const ProfileFormSchema = z.object({
  name: nameSchema,
})
