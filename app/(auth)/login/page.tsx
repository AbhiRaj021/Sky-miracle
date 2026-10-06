import Link from 'next/link'
import { AuthCard } from '@/features/auth/components/auth-card'
import { LoginForm } from '@/features/auth/components/login-form'
import { linkClass } from '@/lib/styles'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <AuthCard
      title="Log in"
      description="Enter your email and password to access your account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className={linkClass}>
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm initialError={error ? 'That link is invalid or has expired. Please try again.' : undefined} />
    </AuthCard>
  )
}
