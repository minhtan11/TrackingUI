import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController, Platform } from '@ionic/angular';
import { StorageService } from './storage-service/storage.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from './apiservice/apiservice.component';
import { Subject, takeUntil } from 'rxjs';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { NotificationServiceComponent } from './notification-service/notification-service.component';
import { FcmService } from './services-fcm/fcm.service';
import { App } from '@capacitor/app';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
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
    private fcmService: FcmService,
  ) { }

  async ngOnInit() {
    let lstUser = await this.storage.get('lstUser');
    if (!lstUser) {
      let lstUser:any = '';
      this.storage.set('lstUser', lstUser);
    }
  }

  ngAfterViewInit() {
    this.platform.ready().then(async () => {
      this.fcmService.initPush();
      this.loadFlashScreen();
      this.getConfig();
    });
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadFlashScreen() {
    let isLogin = await this.storage.get('isLogin');
    if (isLogin) {
      this.navCtrl.navigateForward('main/mainpage',{queryParams:{checklogin:true}});
    }else{
      this.navCtrl.navigateForward('home');
    }
    setTimeout(() => {
      this.isload = false;
      //this.dt.detectChanges();
    }, 3000);
  }

  getConfig(){
    this.api.execByBody('Authencation', 'getconfig', null).pipe(takeUntil(this.destroy$)).subscribe(async (res: any) => {
      this.storage.set('isReview', res?.isMobileReview);
      this.storage.set('versionNo', res?.versionNo);
      this.storage.set('urlFAQ', res?.urlFAQ);
      this.storage.set('urlServiceCharge', res?.urlServiceCharge);
      this.storage.set('infoContent', res?.infoContent);
    })
  }
}
