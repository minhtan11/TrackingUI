import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trakuaidi.app',
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
      launchShowDuration:2000,
      splashFullScreen:true,
      splashImmersive:true,
    },
    Badge: {
      persist: false,
      autoClear: false,
    },
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  }
};

export default config;
