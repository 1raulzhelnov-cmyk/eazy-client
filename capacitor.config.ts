import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e4676b79fc994c6e9a2d8575c2afa291',
  appName: 'Eazy - Food & Flowers Delivery',
  webDir: 'dist',
  server: {
    url: 'https://e4676b79-fc99-4c6e-9a2d-8575c2afa291.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#fafafa',
      showSpinner: false,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#db7093',
    },
  },
};

export default config;