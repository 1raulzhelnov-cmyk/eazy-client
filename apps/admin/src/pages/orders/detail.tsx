import React from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrder, transitionOrder } from '../../api/orders'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { toast } from 'sonner'

export default function OrderDetailPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id!),
    enabled: Boolean(id),
  })

  const mTrans = useMutation({
    mutationFn: ({ action }: { action: string }) => transitionOrder(id!, { action }),
    onSuccess: () => {
      toast.success('Статус обновлён')
      qc.invalidateQueries({ queryKey: ['order', id] })
    },
  })

  if (isLoading) return <div>Загрузка…</div>
  if (!data) return null

  const actionsByStatus: Record<string, string[]> = {
    pending: ['approve', 'cancel'],
    processing: ['ship', 'cancel'],
    delivered: [],
    cancelled: [],
  }

  const actions = actionsByStatus[data.status] || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Order {data.id}</h1>
        <div className="ml-auto flex gap-2">
          {actions.map((a) => (
            <ConfirmDialog key={a} title={`Confirm ${a}`} onConfirm={() => mTrans.mutate({ action: a })}>
              <button className="px-2 py-1 text-xs border rounded">{a}</button>
            </ConfirmDialog>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <div className="font-medium mb-2">Состав корзины</div>
          <pre className="text-xs bg-muted/30 p-2 rounded">{JSON.stringify(data.items ?? [], null, 2)}</pre>
        </div>
        <div className="rounded border p-4">
          <div className="font-medium mb-2">Адрес / Доставка</div>
          <pre className="text-xs bg-muted/30 p-2 rounded">{JSON.stringify(data.delivery ?? {}, null, 2)}</pre>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <div className="font-medium mb-2">Платёж</div>
          {data.payment?.stripeUrl ? (
            <a href={data.payment.stripeUrl} target="_blank" className="text-blue-600 hover:underline">Открыть в Stripe</a>
          ) : (
            <div className="text-sm text-muted-foreground">Нет ссылки</div>
          )}
        </div>
        <div className="rounded border p-4">
          <div className="font-medium mb-2">Лог статусов</div>
          <pre className="text-xs bg-muted/30 p-2 rounded">{JSON.stringify(data.statusLog ?? [], null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
