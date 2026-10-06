import { signOut } from '@/app/actions/auth'
import { NavLinks } from '@/components/dashboard/nav-links'
import { RoleBadge } from '@/components/dashboard/role-badge'
import { requireUser } from '@/lib/auth'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser()

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 text-xs font-bold">
                SM
              </span>
              <span className="hidden font-bold sm:inline">Sky Miracle</span>
            </Link>
            <NavLinks isAdmin={profile.role === 'admin'} />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{profile.name}</p>
              <p className="text-xs text-slate-400">{profile.email}</p>
            </div>
            <RoleBadge role={profile.role} />
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-rose-500/40 hover:text-rose-400"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
