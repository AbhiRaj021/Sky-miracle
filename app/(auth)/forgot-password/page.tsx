'use client'

import { resetPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useActionState } from 'react'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(resetPassword, undefined)

  return (
    <Card className="border-slate-800 bg-slate-900/40 text-white shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Reset Password</CardTitle>
        <CardDescription className="text-slate-400">
          Enter your email address and we will send you a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <div className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
            {state.message}
          </div>
        ) : (
          <form action={action} className="space-y-4">
            {state?.message && (
              <div className="rounded-lg bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20">
                {state.message}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="border-slate-800 bg-slate-950/50 text-white focus:border-blue-500 focus:ring-blue-500/20"
              />
              {state?.errors?.email && (
                <p className="text-xs text-rose-400">{state.errors.email[0]}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:opacity-90 transition-opacity font-semibold"
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending link...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t border-slate-800/40 p-6">
        <div className="text-center text-sm text-slate-400">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
            Log in
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
