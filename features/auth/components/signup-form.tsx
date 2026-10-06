'use client'

import { useActionState } from 'react'
import { FormMessage } from '@/components/ui/form-message'
import { SubmitButton } from '@/components/ui/submit-button'
import { signup } from '../actions'
import { FormField } from './form-field'

export function SignupForm() {
  const [state, action] = useActionState(signup, undefined)

  if (state?.success) {
    return <FormMessage kind="success">{state.message}</FormMessage>
  }

  return (
    <form action={action} className="space-y-4">
      {state?.message && <FormMessage kind="error">{state.message}</FormMessage>}
      <FormField name="name" label="Full Name" autoComplete="name" placeholder="John Doe" required errors={state?.errors?.name} />
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
        autoComplete="new-password"
        required
        errors={state?.errors?.password}
        showAllErrors
      />
      <FormField
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.errors?.confirmPassword}
      />
      <SubmitButton pendingLabel="Creating account..." className="w-full">
        Sign Up
      </SubmitButton>
    </form>
  )
}
