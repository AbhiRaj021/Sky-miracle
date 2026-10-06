'use client'

import { useActionState } from 'react'
import { FormMessage } from '@/components/ui/form-message'
import { SubmitButton } from '@/components/ui/submit-button'
import { requestPasswordReset } from '../actions'
import { FormField } from './form-field'

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined)

  if (state?.success) {
    return <FormMessage kind="success">{state.message}</FormMessage>
  }

  return (
    <form action={action} className="space-y-4">
      {state?.message && <FormMessage kind="error">{state.message}</FormMessage>}
      <FormField
        name="email"
        label="Email Address"
        type="email"
        autoComplete="email"
        placeholder="m@example.com"
        required
        errors={state?.errors?.email}
      />
      <SubmitButton pendingLabel="Sending link..." className="w-full">
        Send Reset Link
      </SubmitButton>
    </form>
  )
}
