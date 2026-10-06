import { PasswordForm } from '@/components/auth/password-form'
import { RoleBadge } from '@/components/dashboard/role-badge'
import { ProfileForm } from '@/components/settings/profile-form'
import { requireUser } from '@/lib/auth'
import { panelClass } from '@/lib/styles'

export default async function SettingsPage() {
  const { profile } = await requireUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 flex items-center gap-2 text-slate-400">
          Your role: <RoleBadge role={profile.role} />
          <span className="text-xs">(only admins can change roles)</span>
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className={panelClass}>
          <h2 className="mb-4 text-lg font-semibold">Profile</h2>
          <ProfileForm name={profile.name} email={profile.email} />
        </section>
        <section className={panelClass}>
          <h2 className="mb-4 text-lg font-semibold">Change password</h2>
          <PasswordForm />
        </section>
      </div>
    </div>
  )
}
