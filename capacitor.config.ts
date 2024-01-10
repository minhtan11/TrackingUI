import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.tracking.app',
  appName: 'Tracking_UI',
  webDir: 'www',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    CapacitorHttp:{
      enabled:true
    },
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  }
};

export default config;
