import React from 'react'
import { cn } from '../../lib/utils'

type Props = {
  status: string
  className?: string
}

const colorBy = (status: string) => {
  const s = status.toLowerCase()
  if (['approved', 'paid', 'delivered', 'active'].includes(s)) return 'bg-green-100 text-green-700'
  if (['pending', 'processing', 'en_route'].includes(s)) return 'bg-yellow-100 text-yellow-800'
  if (['rejected', 'cancelled', 'failed', 'blocked'].includes(s)) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-800'
}

export default function StatusBadge({ status, className }: Props) {
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', colorBy(status), className)}>
      {status}
    </span>
  )
}
