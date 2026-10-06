import { PasswordForm } from '@/components/auth/password-form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Reached from the password reset email: /api/auth/callback signs the user in
// and redirects here so they can choose a new password.
export default function UpdatePasswordPage() {
  return (
    <Card className="border-slate-800 bg-slate-900/40 text-white shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Choose a new password</CardTitle>
        <CardDescription className="text-slate-400">
          Enter a new password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordForm submitLabel="Set New Password" />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t border-slate-800/40 p-6">
        <div className="text-center text-sm text-slate-400">
          <Link href="/dashboard" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
            Continue to dashboard
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
