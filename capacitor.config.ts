import { CapacitorConfig } from '@capacitor/cli';

const devServerUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.eazy.app',
  appName: 'Eazy',
  webDir: 'dist',
  ...(devServerUrl
    ? {
        server: {
          url: devServerUrl,
          cleartext: false,
        },
      }
    : {}),
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