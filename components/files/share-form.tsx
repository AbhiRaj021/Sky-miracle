'use client'

import { shareFile } from '@/app/actions/files'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { errorBoxClass, inputClass, selectClass, successBoxClass } from '@/lib/styles'
import { useActionState } from 'react'

export function ShareForm({ fileId }: { fileId: string }) {
  const [state, action, pending] = useActionState(shareFile, undefined)

  return (
    <form action={action} className="space-y-3">
      {state?.message && <div className={state.success ? successBoxClass : errorBoxClass}>{state.message}</div>}
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
        <Button type="submit" disabled={pending} variant="outline" className="h-10 border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
          {pending ? 'Sharing...' : 'Share'}
        </Button>
      </div>
      {state?.errors?.email && <p className="text-xs text-rose-400">{state.errors.email[0]}</p>}
      {state?.errors?.permission && <p className="text-xs text-rose-400">{state.errors.permission[0]}</p>}
    </form>
  )
}
