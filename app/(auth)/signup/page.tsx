import Link from 'next/link'
import { AuthCard } from '@/features/auth/components/auth-card'
import { SignupForm } from '@/features/auth/components/signup-form'
import { linkClass } from '@/lib/styles'

export default function SignupPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Enter your details below to create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className={linkClass}>
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  )
}
