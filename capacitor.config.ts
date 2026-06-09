import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.cashbackmaximizer',
  appName: 'CardSense',
  webDir: 'out',
  server: {
    url: 'https://cashback-maximizer-flax.vercel.app',
    cleartext: false,
  },
};

export default config;