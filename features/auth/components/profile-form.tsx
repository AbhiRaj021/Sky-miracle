'use client'

import { useActionState, useRef } from 'react'
import { SubmitButton } from '@/components/ui/submit-button'
import { useActionToast } from '@/features/notifications/hooks/use-action-toast'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { updateProfile } from '../actions'
import { profileNameUpdated, selectProfile } from '../store/session-slice'
import { FormField } from './form-field'

export function ProfileForm() {
  const profile = useAppSelector(selectProfile)
  const dispatch = useAppDispatch()
  const submittedName = useRef('')
  const [state, action] = useActionState(updateProfile, undefined)

  // Update the header right away instead of waiting for the server sync.
  useActionToast(state, () => dispatch(profileNameUpdated(submittedName.current)))

  if (!profile) return null

  return (
    <form
      action={(formData) => {
        submittedName.current = String(formData.get('name') ?? '').trim()
        action(formData)
      }}
      className="space-y-4"
    >
      <FormField name="email" label="Email Address" value={profile.email} disabled readOnly />
      <FormField name="name" label="Full Name" defaultValue={profile.name} required errors={state?.errors?.name} />
      <SubmitButton pendingLabel="Saving...">Save changes</SubmitButton>
    </form>
  )
}
