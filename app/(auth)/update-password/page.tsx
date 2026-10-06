import Link from 'next/link'
import { AuthCard } from '@/features/auth/components/auth-card'
import { PasswordForm } from '@/features/auth/components/password-form'
import { linkClass } from '@/lib/styles'

// Reached from the password reset email: /api/auth/callback signs the user in
// and redirects here so they can choose a new password.
export default function UpdatePasswordPage() {
  return (
    <AuthCard
      title="Choose a new password"
      description="Enter a new password for your account"
      footer={
        <Link href="/dashboard" className={linkClass}>
          Continue to dashboard
        </Link>
      }
    >
      <PasswordForm submitLabel="Set New Password" />
    </AuthCard>
  )
}
