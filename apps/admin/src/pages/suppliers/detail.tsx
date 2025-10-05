import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSupplier } from '../../api/suppliers'

export default function SupplierDetailPage() {
  const { sid } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['supplier', sid],
    queryFn: () => getSupplier(sid!),
    enabled: Boolean(sid),
  })

  if (isLoading) return <div>Загрузка…</div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Supplier: {data?.name}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <div className="font-medium">Профиль</div>
          <div className="text-sm text-muted-foreground">Контакт: {data?.contact}</div>
          <div className="text-sm text-muted-foreground">Статус: {data?.status}</div>
        </div>
        <div className="rounded border p-4">
          <div className="font-medium">Документы</div>
          <div className="text-sm text-muted-foreground">Ссылки на storage (placeholder)</div>
        </div>
      </div>
      <div className="rounded border p-4">
        <div className="font-medium">История изменений статуса</div>
        <div className="text-sm text-muted-foreground">Пока пусто</div>
      </div>
    </div>
  )
}
