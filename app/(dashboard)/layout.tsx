import { AppHeader } from '@/components/layout/app-header'
import { SessionHydrator } from '@/features/auth/components/session-hydrator'
import { requireUser } from '@/lib/auth/session'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser()

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <SessionHydrator profile={profile} />
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
