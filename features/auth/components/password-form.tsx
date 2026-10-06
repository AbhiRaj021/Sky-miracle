'use client'

import { useActionState, useRef } from 'react'
import { SubmitButton } from '@/components/ui/submit-button'
import { useActionToast } from '@/features/notifications/hooks/use-action-toast'
import { updatePassword } from '../actions'
import { FormField } from './form-field'

export function PasswordForm({ submitLabel = 'Update Password' }: { submitLabel?: string }) {
  const [state, action] = useActionState(updatePassword, undefined)
  const formRef = useRef<HTMLFormElement>(null)
  useActionToast(state, () => formRef.current?.reset())

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <FormField
        name="password"
        label="New Password"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.errors?.password}
        showAllErrors
      />
      <FormField
        name="confirmPassword"
        label="Confirm New Password"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.errors?.confirmPassword}
      />
      <SubmitButton pendingLabel="Saving..." className="w-full">
        {submitLabel}
      </SubmitButton>
    </form>
  )
}
