import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { listenAuth, type AuthState } from './firebase'

const AuthContext = createContext<AuthState>({ user: null, claims: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, claims: null, loading: true })

  useEffect(() => {
    const unsub = listenAuth(setState)
    return () => unsub()
  }, [])

  const value = useMemo(() => state, [state])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
