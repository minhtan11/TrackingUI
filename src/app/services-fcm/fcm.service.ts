import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { StorageService } from '../storage-service/storage.service';
import { NavController } from '@ionic/angular';
import { ApiserviceComponent } from '../apiservice/apiservice.component';
import { Subject, takeUntil } from 'rxjs';
import { NotificationServiceComponent } from '../notification-service/notification-service.component';
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private destroy$ = new Subject<void>();
  constructor(
    private storage: StorageService,
    private navCtrl: NavController,
    private api: ApiserviceComponent,
    private notification: NotificationServiceComponent,
  ) { }
  async initPush() {
    let platform = await Capacitor.getPlatform();
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

    if (permStatus.receive === 'granted') {
      await PushNotifications.register();
    }

    // On success, we should be able to receive notifications
    await PushNotifications.addListener('registration',
      (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        this.storage.set('token', token.value);
      }
    );

    // Some issue with our setup and push will not work
    await PushNotifications.addListener('registrationError',
      (error: any) => {
        console.log('Error on registration: ' + JSON.stringify(error))
      }
    );

    // Show us the notification payload if the app is open on our device
    await PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.parse(notification.data['data']));
        if (notification) {
          let data = JSON.parse(notification.data['data']);
          switch(data?.TypeRequest){
            case 'loginerror':
              this.storage.remove('isLogin');
              this.navCtrl.navigateBack('home',{queryParams:{loginError:JSON.stringify(data)}});
              break;
          }
        }
      }
    );

    // Method called when tapping on a notification
    await PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }
}
