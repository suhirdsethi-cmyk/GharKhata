import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gharkhata.app',
  appName: 'GharKhata',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
