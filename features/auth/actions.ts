'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type FormState, validationError } from '@/lib/action-state'
import { requireUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import {
  ForgotPasswordFormSchema,
  LoginFormSchema,
  ProfileFormSchema,
  SignupFormSchema,
  UpdatePasswordFormSchema,
} from './schemas'

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignupFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return validationError(parsed.error)

  const { name, email, password } = parsed.data
  const supabase = await createClient()

  // Only the display name goes into user metadata. The role is assigned by the
  // database (handle_new_user) and is never read from the client.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${siteUrl()}/api/auth/callback`,
    },
  })
  if (error) return { message: error.message }

  return {
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
  }
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return validationError(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { message: error.message }

  redirect('/dashboard')
}

export async function requestPasswordReset(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = ForgotPasswordFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return validationError(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/api/auth/callback?next=/update-password`,
  })
  if (error) return { message: error.message }

  return { success: true, message: 'Reset link sent! Please check your email.' }
}

export async function updatePassword(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = UpdatePasswordFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return validationError(parsed.error)

  const { supabase } = await requireUser()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { message: error.message }

  return { success: true, message: 'Your password has been updated.' }
}

export async function updateProfile(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = ProfileFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return validationError(parsed.error)

  const { supabase, user } = await requireUser()
  const { name } = parsed.data

  const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id)
  if (error) return { message: error.message }

  // Keep auth metadata in sync so the name is consistent everywhere.
  await supabase.auth.updateUser({ data: { name } })

  revalidatePath('/', 'layout')
  return { success: true, message: 'Profile updated.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
