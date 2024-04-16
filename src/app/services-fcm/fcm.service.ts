import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor() { }
  async initPush() {
    let platform = await Capacitor.getPlatform()
    if (platform !== 'web') {
      this.registerPush();
      await PushNotifications.createChannel({
        id: "Trakuaidi", // (required)
        name: "TrakuaidiChannel", // (required)
        description: "A channel to categorise your notifications", // (optional) default: undefined.
        importance: 5, // (optional) default: 4. Int value of the Android notification importance
        vibration: true, // (optional) default: true. Creates the default vibration patten if true.
        visibility:1,
        lights:true,
        sound:'default'
      },)
    }
  }

  private async registerPush() {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
  
    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }
  
    await PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        console.log('Push registration success, token: ' + token.value)
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.log('Error on registration: ' + JSON.stringify(error))
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }
}
