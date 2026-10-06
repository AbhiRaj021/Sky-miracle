import Link from 'next/link'
import { AuthCard } from '@/features/auth/components/auth-card'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import { linkClass } from '@/lib/styles'

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      description="Enter your email address and we will send you a password reset link"
      footer={
        <>
          Remember your password?{' '}
          <Link href="/login" className={linkClass}>
            Log in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
