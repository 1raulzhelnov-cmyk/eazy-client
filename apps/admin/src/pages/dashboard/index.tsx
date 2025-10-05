import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getGlobalSummary } from '../../api/analytics'
import { format } from 'date-fns'

export default function DashboardPage() {
  const [range, setRange] = React.useState('7d')
  const { data, isLoading } = useQuery({
    queryKey: ['summary', range],
    queryFn: () => getGlobalSummary(range),
  })

  if (isLoading) return <div>Загрузка…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <select className="ml-auto border rounded px-2 py-1 text-sm" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="today">Today</option>
          <option value="7d">7d</option>
          <option value="30d">30d</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Всего заказов" value={data?.totalOrders ?? 0} />
        <Card title="Выручка" value={`₽ ${Intl.NumberFormat('ru-RU').format(data?.revenue ?? 0)}`} />
        <Card title="Средний чек" value={`₽ ${Intl.NumberFormat('ru-RU').format(data?.averageCheck ?? 0)}`} />
        <Card title="Новые пользователи" value={data?.newUsers ?? 0} />
      </div>

      <div className="rounded-md border p-4">
        <div className="text-sm font-medium mb-2">Выручка по дням</div>
        <div className="grid grid-cols-12 gap-1 h-24 items-end">
          {data?.revenueSeries?.map((p) => (
            <div key={p.date} className="bg-black/80" style={{ height: `${Math.max(4, p.value)}px` }} title={`${format(p.date ? new Date(p.date) : new Date(), 'd.MM')}: ${p.value}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Card({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
