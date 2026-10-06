import * as z from 'zod'

/** State returned by Server Actions used with `useActionState`. */
export type FormState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
      success?: boolean
    }
  | undefined

/** Result returned by Server Actions called imperatively from the client. */
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

/** Converts a failed zod parse into field errors for a form. */
export function validationError(error: z.ZodError): FormState {
  return { errors: z.flattenError(error).fieldErrors as Record<string, string[] | undefined> }
}
