import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { StorageService } from './storage-service/storage.service';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from './apiservice/apiservice.component';
import { Subject, takeUntil } from 'rxjs';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { NotificationServiceComponent } from './notification-service/notification-service.component';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { FcmService } from './services-fcm/fcm.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  isload: any = true;
  private destroy$ = new Subject<void>();
  constructor(
    private platform: Platform,
    private storage: StorageService,
    private api: ApiserviceComponent,
    private navCtrl: NavController,
    private dt: ChangeDetectorRef,
    private router: Router,
    private notification: NotificationServiceComponent,
    private fcmService: FcmService
  ) { }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
      this.fcmService.initPush();
      this.loadFlashScreen();
      this.getConfig();
    });
  }

  ngAfterViewInit() {
    
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadFlashScreen() {
    let isLogin = await this.storage.get('isLogin');
    if (isLogin) {
      this.navCtrl.navigateForward('main/home');
    }else{
      this.navCtrl.navigateForward('home');
    }
    setTimeout(() => {
      this.isload = false;
      this.dt.detectChanges();
    }, 3000);
  }

  getConfig(){
    this.api.execByBody('Authencation', 'getconfig', null).pipe(takeUntil(this.destroy$)).subscribe(async (res: any) => {
      this.storage.set('isReview', res?.isMobileReview);
    })
  }
}
