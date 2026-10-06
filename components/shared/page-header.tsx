export function PageHeader({ title, description }: { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && <div className="mt-1 text-slate-400">{description}</div>}
    </div>
  )
}
