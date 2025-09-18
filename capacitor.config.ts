import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eazy.food',
  appName: 'EAZY FOOD',
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