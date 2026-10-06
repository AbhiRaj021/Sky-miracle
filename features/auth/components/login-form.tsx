'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { FormMessage } from '@/components/ui/form-message'
import { SubmitButton } from '@/components/ui/submit-button'
import { login } from '../actions'
import { FormField } from './form-field'

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action] = useActionState(login, undefined)
  const message = state?.message ?? initialError

  return (
    <form action={action} className="space-y-4">
      {message && <FormMessage kind="error">{message}</FormMessage>}
      <FormField
        name="email"
        label="Email Address"
        type="email"
        autoComplete="email"
        placeholder="m@example.com"
        required
        errors={state?.errors?.email}
      />
      <FormField
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        errors={state?.errors?.password}
        labelAside={
          <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
            Forgot password?
          </Link>
        }
      />
      <SubmitButton pendingLabel="Logging in..." className="w-full">
        Log In
      </SubmitButton>
    </form>
  )
}
