'use server'

import * as z from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { logActivity } from '@/lib/activity'
import { FormState, RoleFormSchema } from '@/lib/definitions'

export async function updateUserRole(state: FormState, formData: FormData): Promise<FormState> {
  const parsed = RoleFormSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
  })
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  const { supabase, user } = await requireAdmin()
  const { userId, role } = parsed.data

  const { data: target } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', userId)
    .maybeSingle()
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
