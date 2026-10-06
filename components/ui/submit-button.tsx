'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { primaryButtonClass } from '@/lib/styles'
import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  pendingLabel: string
  className?: string
  variant?: 'primary' | 'secondary'
}

/** Submit button that shows a spinner while its parent form's action runs. */
export function SubmitButton({ children, pendingLabel, className, variant = 'primary' }: Props) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(
        variant === 'primary'
          ? primaryButtonClass
          : 'h-10 border-slate-700 bg-slate-800 text-white hover:bg-slate-700',
        className,
      )}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </Button>
  )
}
