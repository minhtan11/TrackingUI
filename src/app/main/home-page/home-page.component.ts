import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { IonRouterOutlet, NavController, Platform, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { Subject, connect, takeUntil } from 'rxjs';
import { SplashScreen } from '@capacitor/splash-screen';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { Network } from '@capacitor/network';
import { StorageService } from 'src/app/storage-service/storage.service';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { App } from '@capacitor/app';
import Swiper from 'swiper';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent{
  //#region Contrucstor
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper:Swiper;
  oUser:any;
  ship1:any;
  ship2:any;
  pack3:any;
  pack5:any;
  isReview:any;
  animationInProgress = false;
  animation:any;
  private destroy$ = new Subject<void>();
  constructor(
    private router: Router,
    private dt : ChangeDetectorRef,
    private rt : ActivatedRoute,
    private navCtrl: NavController,
    private platform : Platform,
    private api : ApiserviceComponent,
    private storage: StorageService,
    private notification: NotificationServiceComponent,
    private routerOutlet: IonRouterOutlet
  ) { 
    // router.events.subscribe((val: any) => {
    //   if (val instanceof NavigationEnd && val?.type === 1 && (val?.url.includes('/main/mainpage'))) {
    //     this.getTime();
    //     this.getUser();
    //     this.getDashBoard();
    //   }
    // });
  }
  //#endregion

  //#region Init
  async ngOnInit() {
    this.isReview = await this.storage.get('isReview');
    this.routerOutlet.swipeGesture = false;
  }

  ngAfterViewInit(){
    
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    this.isReview = await this.storage.get('isReview');
    this.dt.detectChanges();
    this.getDashBoard();
    this.animationInProgress = false;
    this.startAnimation();
  }

  ionViewDidLeave(){
    this.swiper.disable();
    clearTimeout(this.animation);
  }

  startAnimation() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
    if(this.swiper){
      this.swiper.enable();
    } 
    if(this.animationInProgress) return;
    this.animationInProgress = true;
    this.animation = setTimeout(() => {
      if (this.swiper) {
        this.swiper.slideNext(1000,false);
      }
      this.animationInProgress = false;
      this.startAnimation();
    }, 5000);
  }
  //#endregion

  //#region Function
  goOrderPage(status:any=''){
    if (status) {
      this.navCtrl.navigateForward('main/order',{queryParams:{status:status}});
      return;
    }
    this.navCtrl.navigateForward('main/order');
    this.onDestroy();
  }

  goPackagePage(status:any=''){
    if (status) {
      this.navCtrl.navigateForward('main/package',{queryParams:{status:status}});
      return;
    }
    this.navCtrl.navigateForward('main/package');
  }

  goRechargePage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/recharge');
  }

  goServicechargePage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/service-charge');
  }

  async getDashBoard(){
    let username = await this.storage.get('username');
    let data = {
      userName:username,
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'dashboard', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      }else{
        this.pack3 = res[1][0];
        this.pack5 = res[1][2];
        this.ship1 = res[2][0];
        this.ship2 = res[2][1];
        this.dt.detectChanges();
      }
    })
  }
  //#endregion

}
