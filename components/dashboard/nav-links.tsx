'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const links = [
    { href: '/dashboard', label: 'Files', active: pathname === '/dashboard' || pathname.startsWith('/dashboard/files') },
    { href: '/dashboard/settings', label: 'Settings', active: pathname.startsWith('/dashboard/settings') },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', active: pathname.startsWith('/admin') }] : []),
  ]

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition',
            link.active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white',
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
