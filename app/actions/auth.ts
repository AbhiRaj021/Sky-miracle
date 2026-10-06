'use server'

import * as z from 'zod'
import {
  SignupFormSchema,
  LoginFormSchema,
  ForgotPasswordFormSchema,
  UpdatePasswordFormSchema,
  ProfileFormSchema,
  FormState,
} from '@/lib/definitions'
import { getSupabase, requireUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    }
  }

  if (validatedFields.data.password !== formData.get('confirmPassword')) {
    return {
      errors: {
        confirmPassword: ['Passwords do not match.'],
      },
    }
  }

  const { name, email, password } = validatedFields.data
  const supabase = await getSupabase()

  // Only the display name goes into user metadata. The role is assigned by the
  // database (see handle_new_user) and is never read from the client.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${siteUrl()}/api/auth/callback`,
    },
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  return {
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
  }
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    }
  }

  const supabase = await getSupabase()
  const { error } = await supabase.auth.signInWithPassword(validatedFields.data)

  if (error) {
    return {
      message: error.message,
    }
  }

  redirect('/dashboard')
}

export async function resetPassword(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = ForgotPasswordFormSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    }
  }

  const supabase = await getSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(validatedFields.data.email, {
    redirectTo: `${siteUrl()}/api/auth/callback?next=/update-password`,
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  return {
    success: true,
    message: 'Reset link sent! Please check your email.',
  }
}

export async function updatePassword(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = UpdatePasswordFormSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    }
  }

  const { supabase } = await requireUser()
  const { error } = await supabase.auth.updateUser({
    password: validatedFields.data.password,
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  return {
    success: true,
    message: 'Your password has been updated.',
  }
}

export async function updateProfile(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = ProfileFormSchema.safeParse({
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    }
  }

  const { supabase, user } = await requireUser()
  const { name } = validatedFields.data

  const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id)
  if (error) {
    return {
      message: error.message,
    }
  }

  // Keep auth metadata in sync so the name is consistent everywhere.
  await supabase.auth.updateUser({ data: { name } })

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: 'Profile updated.',
  }
}

export async function signOut() {
  const supabase = await getSupabase()
  await supabase.auth.signOut()
  redirect('/login')
}
