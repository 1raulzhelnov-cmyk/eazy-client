import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { listOrders } from '../../api/orders'
import StatusBadge from '../../components/common/StatusBadge'
import SearchInput from '../../components/common/SearchInput'
import { DataTable } from '../../components/common/DataTable'
import { Link } from 'react-router-dom'

export default function OrdersListPage() {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['orders', query, status],
    queryFn: () => listOrders({ query, status, page: 1, limit: 20 }),
  })

  const columns = React.useMemo(() => {
    return [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }: any) => <Link to={`/orders/${row.original.id}`} className="text-blue-600 hover:underline">{row.original.id}</Link>,
      },
      { accessorKey: 'customerEmail', header: 'Клиент' },
      { accessorKey: 'supplierName', header: 'Поставщик' },
      { accessorKey: 'amount', header: 'Сумма' },
      { accessorKey: 'status', header: 'Статус', cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
      { accessorKey: 'paymentStatus', header: 'Оплата' },
      { accessorKey: 'createdAt', header: 'Создан' },
    ] as any
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <h1 className="text-xl font-semibold">Orders</h1>
        <div className="ml-auto w-64">
          <SearchInput value={query} onChange={setQuery} placeholder="Поиск по ID/email" />
        </div>
        <select className="border rounded px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Все статусы</option>
          <option value="pending">pending</option>
          <option value="processing">processing</option>
          <option value="delivered">delivered</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>
      {isLoading ? <div>Загрузка…</div> : <DataTable columns={columns} data={data?.items ?? []} />}
    </div>
  )
}
