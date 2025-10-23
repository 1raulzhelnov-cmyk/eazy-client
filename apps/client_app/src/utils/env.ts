import Config from 'react-native-config';

export type FirebaseConfig = {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

export const API_URL: string = Config.API_URL ?? '';
export const GOOGLE_MAPS_API_KEY: string = Config.GOOGLE_MAPS_API_KEY ?? '';
export const STRIPE_PUBLISHABLE_KEY: string = Config.STRIPE_PUBLISHABLE_KEY ?? '';

export const FIREBASE_CONFIG: FirebaseConfig = (() => {
  try {
    const raw = Config.FIREBASE_CONFIG ?? '{}';
    return JSON.parse(raw) as FirebaseConfig;
  } catch {
    return {
      apiKey: '',
      projectId: '',
      appId: '',
    } as FirebaseConfig;
  }
})();

export function validateEnv(): void {
  if (!API_URL) {
    console.warn('Missing API_URL in environment');
  }
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Missing GOOGLE_MAPS_API_KEY in environment');
  }
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('Missing STRIPE_PUBLISHABLE_KEY in environment');
  }
}
