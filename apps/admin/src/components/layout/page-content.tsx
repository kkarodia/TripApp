import { cn } from '@/lib/utils'

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn('flex-1 p-6 overflow-auto', className)}>
      {children}
    </div>
  )
}
