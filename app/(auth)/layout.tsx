import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-xl shadow-blue-500/25">
            <span className="text-xl font-bold text-white">SM</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
            Sky Miracle
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Document Management & Collaboration
          </p>
        </div>

        {/* Children card */}
        {children}
      </div>
    </div>
  )
}
