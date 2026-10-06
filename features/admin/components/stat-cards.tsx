import { panelClass } from '@/lib/styles'

export function StatCards({ stats }: { stats: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className={panelClass}>
          <p className="text-sm text-slate-400">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
