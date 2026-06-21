'use server'

import { SignupFormSchema, LoginFormSchema, ForgotPasswordFormSchema, FormState } from '@/lib/definitions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name,
    email,
    password,
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  if (password !== confirmPassword) {
    return {
      errors: {
        password: ['Passwords do not match.'],
      },
    }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Sign up user
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`,
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
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validatedFields = LoginFormSchema.safeParse({
    email,
    password,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  redirect('/dashboard')
}

export async function resetPassword(state: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string

  const validatedFields = ForgotPasswordFormSchema.safeParse({
    email,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/dashboard/settings`,
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
