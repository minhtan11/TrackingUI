import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController, Platform } from '@ionic/angular';
import { StorageService } from './storage-service/storage.service';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from './apiservice/apiservice.component';
import { Subject, takeUntil } from 'rxjs';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { NotificationServiceComponent } from './notification-service/notification-service.component';
import { FcmService } from './services-fcm/fcm.service';
import { App } from '@capacitor/app';

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
    private fcmService: FcmService,
  ) { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.platform.ready().then(async () => {
      this.fcmService.initPush();
      this.loadFlashScreen();
      this.getConfig();
    });
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if ((this.router.url.includes('main/service-charge')) ||  (this.router.url.includes('main/recharge')) 
        || (this.router.url.includes('main/setting/information')) ||  (this.router.url.includes('main/setting/withdraw')) ||  (this.router.url.includes('main/setting/changepassword'))) {
        this.navCtrl.navigateBack('main');
        return;
      }
      if ((this.router.url.includes('/main/package'))) {
        if ((this.router.url.includes('/main/package/create')) || (this.router.url.includes('/main/package/detail'))) {
          this.navCtrl.navigateBack('main/package');
        }else{
          if (!(this.router.url.includes('/main/package/orderstatus'))) {
            this.navCtrl.navigateBack('main',{queryParams:{selected:0}});
          }
        }
        return;
      }
      if ((this.router.url.includes('/main/order'))) {
        if ((this.router.url.includes('/main/order/detail'))) {
          this.navCtrl.navigateBack('main/order');
        }else{
          this.navCtrl.navigateBack('main',{queryParams:{selected:0}});
        }
        return;
      }
      App.minimizeApp();
    });
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadFlashScreen() {
    let isLogin = await this.storage.get('isLogin');
    if (isLogin) {
      this.navCtrl.navigateForward('main',{queryParams:{checklogin:true}});
    }else{
      this.navCtrl.navigateForward('home');
    }
    setTimeout(() => {
      this.isload = false;
      this.dt.detectChanges();
    }, 4000);
  }

  getConfig(){
    this.api.execByBody('Authencation', 'getconfig', null).pipe(takeUntil(this.destroy$)).subscribe(async (res: any) => {
      this.storage.set('isReview', res?.isMobileReview);
    })
  }
}
