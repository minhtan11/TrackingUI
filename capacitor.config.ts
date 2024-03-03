import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';

const config: CapacitorConfig = {
  appId: 'com.tracking.app',
  appName: 'Trakuaidi',
  webDir: 'www',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    CapacitorHttp:{
      enabled:true
    },
    SplashScreen:{
      launchAutoHide:true,
      launchShowDuration:500,
      splashFullScreen:true,
      splashImmersive:true,
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  }
};

export default config;
