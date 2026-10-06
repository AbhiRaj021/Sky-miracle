'use client'

import { updateProfile } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { errorBoxClass, inputClass, labelClass, primaryButtonClass, successBoxClass } from '@/lib/styles'
import { useActionState } from 'react'

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  return (
    <form action={action} className="space-y-4">
      {state?.message && <div className={state.success ? successBoxClass : errorBoxClass}>{state.message}</div>}
      <div className="space-y-2">
        <label htmlFor="email" className={labelClass}>
          Email Address
        </label>
        <Input id="email" value={email} disabled readOnly className={inputClass} />
      </div>
      <div className="space-y-2">
        <label htmlFor="name" className={labelClass}>
          Full Name
        </label>
        <Input id="name" name="name" defaultValue={name} required className={inputClass} />
        {state?.errors?.name && <p className="text-xs text-rose-400">{state.errors.name[0]}</p>}
      </div>
      <Button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  )
}
