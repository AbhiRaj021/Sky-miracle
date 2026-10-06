import Link from 'next/link'
import { NavLinks } from './nav-links'
import { UserMenu } from './user-menu'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 text-xs font-bold">
              SM
            </span>
            <span className="hidden font-bold sm:inline">Sky Miracle</span>
          </Link>
          <NavLinks />
        </div>
        <UserMenu />
      </div>
    </header>
  )
}
