import { initializeApp, getApps } from 'firebase/app'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export function initFirebase() {
  if (!getApps().length) {
    initializeApp(firebaseConfig)
  }
  return getAuth()
}

export type AuthState = {
  user: User | null
  claims: Record<string, unknown> | null
  loading: boolean
}

export function listenAuth(callback: (state: AuthState) => void) {
  const auth = initFirebase()
  callback({ user: auth.currentUser, claims: null, loading: true })

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ user: null, claims: null, loading: false })
      return
    }
    try {
      const token = await user.getIdTokenResult(true)
      callback({ user, claims: token.claims ?? {}, loading: false })
    } catch {
      callback({ user, claims: null, loading: false })
    }
  })
}
