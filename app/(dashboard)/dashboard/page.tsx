'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.name || user.email || '')
      }
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white p-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Welcome, {userName}!
          </h1>
          <p className="text-slate-400 mt-1">Sky Miracle Dashboard</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold hover:bg-rose-700 transition"
        >
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
          <h2 className="text-xl font-bold mb-2">Phase 1 Complete!</h2>
          <p className="text-slate-400 text-sm">
            Project setup, Supabase authentication, routing, and database migrations are fully configured.
          </p>
        </div>
      </div>
    </div>
  )
}
