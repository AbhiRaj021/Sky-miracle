'use client'

import { useActionState, useRef } from 'react'
import { FieldError } from '@/components/ui/form-message'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'
import { useActionToast } from '@/features/notifications/hooks/use-action-toast'
import { inputClass, selectClass } from '@/lib/styles'
import { shareFile } from '../actions'

export function ShareForm({ fileId }: { fileId: string }) {
  const [state, action] = useActionState(shareFile, undefined)
  const formRef = useRef<HTMLFormElement>(null)
  useActionToast(state, () => formRef.current?.reset())

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="fileId" value={fileId} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="email"
          type="email"
          required
          placeholder="colleague@example.com"
          aria-label="Email address"
          className={`${inputClass} flex-1`}
        />
        <select name="permission" defaultValue="view" aria-label="Permission" className={selectClass}>
          <option value="view">Can view</option>
          <option value="edit">Can edit</option>
        </select>
        <SubmitButton pendingLabel="Sharing..." variant="secondary">
          Share
        </SubmitButton>
      </div>
      <FieldError errors={state?.errors?.email} />
      <FieldError errors={state?.errors?.permission} />
    </form>
  )
}
