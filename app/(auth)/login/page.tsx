'use client'

import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useActionState } from 'react'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <Card className="border-slate-800 bg-slate-900/40 text-white shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Log in</CardTitle>
        <CardDescription className="text-slate-400">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="border-slate-800 bg-slate-950/50 text-white focus:border-blue-500 focus:ring-blue-500/20"
            />
            {state?.errors?.password && (
              <p className="text-xs text-rose-400">{state.errors.password[0]}</p>
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
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t border-slate-800/40 p-6">
        <div className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
