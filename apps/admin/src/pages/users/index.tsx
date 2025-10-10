import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import SearchInput from '../../components/common/SearchInput'
import { DataTable } from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import { listUsers, updateUserRole, updateUser, type AdminUser } from '../../api/users'
import { toast } from 'sonner'

export default function UsersListPage() {
  const qc = useQueryClient()
  const [query, setQuery] = React.useState('')
  const [role, setRole] = React.useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', query, role],
    queryFn: () => listUsers({ query, role, page: 1, limit: 20 }),
  })

  const mRole = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: AdminUser['role'] }) => updateUserRole(uid, role),
    onSuccess: () => {
      toast.success('Роль обновлена')
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const mBlock = useMutation({
    mutationFn: ({ uid, blocked }: { uid: string; blocked: boolean }) => updateUser(uid, { status: blocked ? 'blocked' : 'active' } as any),
    onSuccess: () => {
      toast.success('Статус обновлён')
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const columns = React.useMemo(() => {
    return [
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'displayName', header: 'Имя' },
      { accessorKey: 'role', header: 'Роль' },
      {
        accessorKey: 'status',
        header: 'Статус',
        cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: 'createdAt', header: 'Создан' },
      {
        id: 'actions',
        header: '',
        cell: ({ row }: any) => {
          const u: AdminUser = row.original
          return (
            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1 text-xs"
                value={u.role}
                onChange={(e) => mRole.mutate({ uid: u.uid, role: e.target.value as AdminUser['role'] })}
              >
                {['user', 'driver', 'supplier', 'admin'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                className="px-2 py-1 text-xs border rounded"
                onClick={() => mBlock.mutate({ uid: u.uid, blocked: u.status !== 'blocked' })}
              >
                {u.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
              </button>
            </div>
          )
        },
      },
    ] as any
  }, [mRole, mBlock])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <h1 className="text-xl font-semibold">Users</h1>
        <div className="ml-auto w-64">
          <SearchInput value={query} onChange={setQuery} placeholder="Поиск по email" />
        </div>
        <select className="border rounded px-2 py-1 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Все роли</option>
          {['user', 'driver', 'supplier', 'admin'].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div>Загрузка…</div>
      ) : (
        <DataTable columns={columns} data={data?.items ?? []} />
      )}
    </div>
  )
}
