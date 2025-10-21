import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eazy.app',
  appName: 'Eazy',
  webDir: 'dist',
  // Не указывать server.url для production-сборок Capacitor
  server: {
    androidScheme: 'https',
    cleartext: true,
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