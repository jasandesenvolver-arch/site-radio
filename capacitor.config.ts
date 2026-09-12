import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.studiofm.radio',
  appName: 'Rádio Studio FM',
  webDir: 'dist',
  plugins: {
    AdMob: {
      // ID de teste oficial. Troque pelo seu ID antes de publicar.
      appId: 'ca-app-pub-3940256099942544~3347511713'
    }
  }
};

export default config;
