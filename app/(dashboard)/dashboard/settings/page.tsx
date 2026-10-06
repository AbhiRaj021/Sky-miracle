import { PageHeader } from '@/components/shared/page-header'
import { RoleBadge } from '@/components/shared/role-badge'
import { PasswordForm } from '@/features/auth/components/password-form'
import { ProfileForm } from '@/features/auth/components/profile-form'
import { requireUser } from '@/lib/auth/session'
import { panelClass } from '@/lib/styles'

export default async function SettingsPage() {
  const { profile } = await requireUser()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description={
          <span className="flex items-center gap-2">
            Your role: <RoleBadge role={profile.role} />
            <span className="text-xs">(only admins can change roles)</span>
          </span>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        <section className={panelClass}>
          <h2 className="mb-4 text-lg font-semibold">Profile</h2>
          <ProfileForm />
        </section>
        <section className={panelClass}>
          <h2 className="mb-4 text-lg font-semibold">Change password</h2>
          <PasswordForm />
        </section>
      </div>
    </div>
  )
}
