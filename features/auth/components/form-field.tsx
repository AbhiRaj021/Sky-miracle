import { FieldError } from '@/components/ui/form-message'
import { Input } from '@/components/ui/input'
import { inputClass, labelClass } from '@/lib/styles'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string
  label: string
  errors?: string[]
  showAllErrors?: boolean
  labelAside?: React.ReactNode
}

/** Labelled input with inline validation errors. */
export function FormField({ name, label, errors, showAllErrors, labelAside, id = name, ...inputProps }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        {labelAside}
      </div>
      <Input id={id} name={name} aria-invalid={errors?.length ? true : undefined} className={inputClass} {...inputProps} />
      <FieldError errors={errors} all={showAllErrors} />
    </div>
  )
}
