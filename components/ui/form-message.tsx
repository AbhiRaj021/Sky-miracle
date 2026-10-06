import { cn } from '@/lib/utils'

export function FormMessage({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg border p-3 text-sm',
        kind === 'error'
          ? 'border-rose-500/20 bg-rose-500/10 text-rose-400'
          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      )}
    >
      {children}
    </div>
  )
}

/** Field-level validation errors. Shows every message as a bullet when `all` is set. */
export function FieldError({ errors, all = false }: { errors?: string[]; all?: boolean }) {
  if (!errors?.length) return null
  if (!all) return <p className="text-xs text-rose-400">{errors[0]}</p>
  return (
    <div className="space-y-1 text-xs text-rose-400">
      {errors.map((error) => (
        <p key={error}>• {error}</p>
      ))}
    </div>
  )
}
