'use client'

import { updatePassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { errorBoxClass, inputClass, labelClass, primaryButtonClass, successBoxClass } from '@/lib/styles'
import { useActionState } from 'react'

export function PasswordForm({ submitLabel = 'Update Password' }: { submitLabel?: string }) {
  const [state, action, pending] = useActionState(updatePassword, undefined)

  return (
    <form action={action} className="space-y-4">
      {state?.message && (
        <div className={state.success ? successBoxClass : errorBoxClass}>{state.message}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="password" className={labelClass}>
          New Password
        </label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required className={inputClass} />
        {state?.errors?.password && (
          <div className="text-xs text-rose-400 space-y-1">
            {state.errors.password.map((err) => (
              <p key={err}>• {err}</p>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm New Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className={inputClass}
        />
        {state?.errors?.confirmPassword && (
          <p className="text-xs text-rose-400">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending} className={`w-full ${primaryButtonClass}`}>
        {pending ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
