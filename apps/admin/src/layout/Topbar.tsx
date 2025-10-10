import React from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { useAuth } from '../auth/useAuth'

export function Topbar() {
  const { user } = useAuth()

  const onLogout = async () => {
    await signOut(getAuth())
  }

  return (
    <div className="h-14 border-b flex items-center justify-end px-4 gap-3">
      <div className="text-sm text-muted-foreground">{user?.email}</div>
      <button onClick={onLogout} className="text-sm px-3 py-1.5 border rounded-md hover:bg-accent">
        Выйти
      </button>
    </div>
  )
}
