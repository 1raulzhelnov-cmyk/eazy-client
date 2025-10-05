import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listSuppliers, verifySupplier, type Supplier } from '../../api/suppliers'
import StatusBadge from '../../components/common/StatusBadge'
import { DataTable } from '../../components/common/DataTable'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function SuppliersListPage() {
  const qc = useQueryClient()
  const nav = useNavigate()
  const [status, setStatus] = React.useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', status],
    queryFn: () => listSuppliers({ status: status || undefined }),
  })

  const mVerify = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: 'approved' | 'rejected'; reason?: string }) =>
      verifySupplier(id, { status, reason }),
    onSuccess: () => {
      toast.success('Статус обновлён')
      qc.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })

  const columns = React.useMemo(() => {
    return [
      { accessorKey: 'name', header: 'Название' },
      { accessorKey: 'contact', header: 'Контакт' },
      { accessorKey: 'status', header: 'Статус', cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
      { accessorKey: 'createdAt', header: 'Дата заявки' },
      {
        id: 'actions',
        header: '',
        cell: ({ row }: any) => {
          const s: Supplier = row.original
          return (
            <div className="flex gap-2">
              <button className="px-2 py-1 text-xs border rounded" onClick={() => nav(`/suppliers/${s.id}`)}>Открыть</button>
              <ConfirmDialog title="Approve supplier" onConfirm={() => mVerify.mutate({ id: s.id, status: 'approved' })}>
                <button className="px-2 py-1 text-xs border rounded">Approve</button>
              </ConfirmDialog>
              <ConfirmDialog title="Reject supplier" onConfirm={() => mVerify.mutate({ id: s.id, status: 'rejected' })}>
                <button className="px-2 py-1 text-xs border rounded">Reject</button>
              </ConfirmDialog>
            </div>
          )
        },
      },
    ] as any
  }, [mVerify, nav])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <h1 className="text-xl font-semibold">Suppliers</h1>
        <select className="ml-auto border rounded px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Все</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {isLoading ? <div>Загрузка…</div> : <DataTable columns={columns} data={data?.items ?? []} />}
    </div>
  )
}
