import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authCardClass } from '@/lib/styles'

type Props = {
  title: string
  description: string
  footer?: React.ReactNode
  children: React.ReactNode
}

export function AuthCard({ title, description, footer, children }: Props) {
  return (
    <Card className={authCardClass}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">{title}</CardTitle>
        <CardDescription className="text-slate-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter className="flex flex-col space-y-4 border-t border-slate-800/40 p-6">
          <div className="text-center text-sm text-slate-400">{footer}</div>
        </CardFooter>
      )}
    </Card>
  )
}
