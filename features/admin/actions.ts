'use server'

import { revalidatePath } from 'next/cache'
import { logActivity } from '@/features/activity/log'
import { type FormState, validationError } from '@/lib/action-state'
import { requireAdmin } from '@/lib/auth/session'
import { RoleFormSchema } from './schemas'

export async function updateUserRole(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = RoleFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return validationError(parsed.error)

  const { supabase, user } = await requireAdmin()
  const { userId, role } = parsed.data

  const { data: target } = await supabase.from('profiles').select('id, name, role').eq('id', userId).maybeSingle()
  if (!target) return { message: 'User not found.' }
  if (target.role === role) return { success: true }

  // The guard_profile_update trigger also enforces admin-only changes and
  // refuses to remove the last admin.
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) return { message: error.message }

  await logActivity(supabase, user.id, 'role_change', null, {
    target_id: target.id,
    target_name: target.name,
    from: target.role,
    to: role,
  })

  revalidatePath('/admin')
  return { success: true, message: `${target.name} is now ${role === 'admin' ? 'an' : 'a'} ${role}.` }
}
