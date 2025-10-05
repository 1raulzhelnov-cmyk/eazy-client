import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assignDriver, listDelivery, updateDelivery, type Delivery } from '../../api/delivery'
import { DataTable } from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import { toast } from 'sonner'

export default function DeliveryListPage() {
  const qc = useQueryClient()
  const [status, setStatus] = React.useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['delivery', status],
    queryFn: () => listDelivery({ status: status || undefined, page: 1 }),
  })

  const mAssign = useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string }) => assignDriver({ orderId, driverId }),
    onSuccess: () => {
      toast.success('Водитель назначен')
      qc.invalidateQueries({ queryKey: ['delivery'] })
    },
  })

  const mUpdate = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Delivery['status'] }) => updateDelivery(orderId, { status }),
    onSuccess: () => {
      toast.success('Статус обновлён')
      qc.invalidateQueries({ queryKey: ['delivery'] })
    },
  })

  const columns = React.useMemo(() => {
    return [
      { accessorKey: 'orderId', header: 'Заказ' },
      { accessorKey: 'driverId', header: 'Водитель' },
      { accessorKey: 'eta', header: 'ETA' },
      { accessorKey: 'status', header: 'Статус', cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
      { accessorKey: 'updatedAt', header: 'Обновлён' },
      {
        id: 'actions',
        header: '',
        cell: ({ row }: any) => {
          const d: Delivery = row.original
          return (
            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1 text-xs"
                value={d.driverId ?? ''}
                onChange={(e) => mAssign.mutate({ orderId: d.orderId, driverId: e.target.value })}
              >
                <option value="">— назначить —</option>
                {/* Placeholder: drivers list should be fetched; minimal MVP */}
                {['driver1', 'driver2', 'driver3'].map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
              <select
                className="border rounded px-2 py-1 text-xs"
                value={d.status}
                onChange={(e) => mUpdate.mutate({ orderId: d.orderId, status: e.target.value as Delivery['status'] })}
              >
                {['assigned', 'en_route', 'delivered'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )
        },
      },
    ] as any
  }, [mAssign, mUpdate])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <h1 className="text-xl font-semibold">Delivery</h1>
        <select className="ml-auto border rounded px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Все статусы</option>
          <option value="assigned">assigned</option>
          <option value="en_route">en_route</option>
          <option value="delivered">delivered</option>
        </select>
      </div>

      {isLoading ? <div>Загрузка…</div> : <DataTable columns={columns} data={data?.items ?? []} />}
    </div>
  )
}
