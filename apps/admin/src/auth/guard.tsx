import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, claims, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="p-8">Загрузка…</div>
  if (!user) return <Navigate to={"/denied"} state={{ from: location }} replace />
  const isAdmin = Boolean((claims as any)?.admin)
  if (!isAdmin) return <Navigate to={"/denied"} replace />

  return <>{children}</>
}
