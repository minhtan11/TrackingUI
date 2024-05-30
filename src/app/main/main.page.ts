import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonContent, IonRouterOutlet, IonTabs, NavController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StorageService } from '../storage-service/storage.service';
import { Clipboard, ReadResult } from '@capacitor/clipboard';
import { ApiserviceComponent } from '../apiservice/apiservice.component';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { Device } from '@capacitor/device';
import { NotificationServiceComponent } from '../notification-service/notification-service.component';
import { register } from 'swiper/element/bundle';
import Swiper from 'swiper';
import { PushNotificationSchema, PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { App } from '@capacitor/app';
import { PreviousRouterServiceService } from '../previous-router-service/previous-router-service.service';
register();

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage implements OnInit {
  //#region Contructor
  @ViewChild(IonContent) content: IonContent;
  isReview:any;
  isOpenCopy:any=false;
  textCopy:any = '';
  selected:any = 0;
  isOpenExit:any=false;
  private destroy$ = new Subject<void>();
  constructor(
    private navCtrl: NavController,
    private dt : ChangeDetectorRef,
    private storage: StorageService,
    private rt : ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private platform : Platform,
    private api: ApiserviceComponent,
    private notification: NotificationServiceComponent,
    private router: Router
    
  ) {
    //this.isReview = this.rt.snapshot.queryParams["isReview"];
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {        
        if (event && event.urlAfterRedirects.includes('/main/mainpage')) {
          if(this.selected != 0){
            this.selected = 0;
            dt.detectChanges();
          }
          return;
        }
        if (event && event.urlAfterRedirects.includes('/main/package')) {
          if(this.selected != 1){
            this.selected = 1;
            dt.detectChanges();
          }
          return;
        }
      };
    });
   }
  //#endregion
  
  //#region Init
  ngOnInit() {
    this.platform.ready().then(async () => {
      let checklogin = this.rt.snapshot.queryParams["checklogin"];
      if (checklogin) {
        this.onCheckLogin();
      }
      this.platform.resume.subscribe(async () => {
        this.onCheckLogin();
        if (!(this.router.url.includes('/main/package/create'))) {
          Clipboard.read().then((clipboardRead: ReadResult) => {
            if (clipboardRead?.value) {
              let value = clipboardRead?.value;
              this.textCopy = value.replace(/(\r\n\s|\r|\n|\s)/g, ',');
              this.isOpenCopy = true;
              this.dt.detectChanges();
              return;
            }
          });
        }
      });
    })
  }

  async ngAfterViewInit() {
    await PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        //this.refreshNoti();
      }
    );
    // this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
    //   if ((this.router.url.includes('main/history')) ||  (this.router.url.includes('main/notification')) ||  (this.router.url.includes('main/setting'))) {
    //     this.navCtrl.navigateBack('main');
    //     return;
    //   }
    //   if((this.router.url.includes('main/package'))){
    //     if((!this.router.url.includes('main/package/create')) || (!this.router.url.includes('main/package/detail')) || (!this.router.url.includes('main/package/orderstatus'))){
    //       this.navCtrl.navigateBack('main');
    //     }
    //     return;
    //   }
    //   if((this.router.url.includes('main/order'))){
    //     if((!this.router.url.includes('main/package/create')) || (!this.router.url.includes('main/package/detail')) || (!this.router.url.includes('main/package/orderstatus'))){
    //       this.navCtrl.navigateBack('main');
    //     }
    //     return;
    //   }
    //   if((this.router.url.includes('main/setting'))){
    //     if((!this.router.url.includes('main/package/information')) || (!this.router.url.includes('main/package/withdraw')) || (!this.router.url.includes('main/package/changepassword'))
    //       || (!this.router.url.includes('main/package/report'))){
    //       this.navCtrl.navigateBack('main');
    //     }
    //     return;
    //   }
    //   if((this.router.url.includes('main/mainpage'))){
    //     this.isOpenExit = true;
    //     this.dt.detectChanges();
    //     return;
    //   }
    //   processNextHandler();
    // });
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    this.isReview = await this.storage.get('isReview');
    this.dt.detectChanges();
    // let selected = this.rt.snapshot.queryParams["selected"];
    // if (selected != null) {
    //   this.selected = selected;
    //   switch(selected){
    //     case 0:
    //     case 3:
    //       break;
    //   }
    //   this.dt.detectChanges();
    // }
    this.routerOutlet.swipeGesture = false; 
    
  } 
  //#endregion

  //#region Event
  selectedTabChange(event:any){
    let tab = event?.tab.textLabel;
    if (tab) {
      switch(tab){
        case 'home':
          if(this.selected == 1 || this.selected == 2 || this.selected == 3 || this.selected == 4)
            this.navCtrl.navigateBack('main');
          else
            this.navCtrl.navigateForward('main');
          this.selected = 0;
          break;
        case 'package':
          if(this.selected == 0)
            this.navCtrl.navigateForward('main/package');
          else
            this.navCtrl.navigateBack('main/package');
          this.selected = 1;
          break;
        case 'history':
          if(this.selected == 0 || this.selected == 1)
            this.navCtrl.navigateForward('main/history');
          else
            this.navCtrl.navigateBack('main/history');
          this.selected = 2;
          break;
        case 'notification':
          if(this.selected == 0 || this.selected == 1 || this.selected == 2)
            this.navCtrl.navigateForward('main/notification');
          else
            this.navCtrl.navigateBack('main/notification');
          this.selected = 3;
          break;
        case 'setting':
          if(this.selected == 0 || this.selected == 1 || this.selected == 2 || this.selected == 3)
            this.navCtrl.navigateForward('main/setting');
          else
            this.navCtrl.navigateBack('main/setting');
          this.selected = 4;
          break;
      }
    }
  }
  //#endregion

  //#region Function
  onCopy(){
    this.cancelCopy();
    this.navCtrl.navigateForward('main/package/create',{queryParams:{code:this.textCopy}});
  }

  cancelCopy(){
    this.isOpenCopy = false;
    Clipboard.write({
      string: ""
    });
    this.dt.detectChanges();
  }

  async onCheckLogin(){
    let token = await this.storage.get('token');
    const info = await Device.getInfo();
    const infoID = await Device.getId();
    let deviceName = info.manufacturer+' '+info.model;
    let deviceID = infoID.identifier;
    let username = await this.storage.get('username');
    let data = {
      userName: username,
      token: token,
      deviceName: deviceName,
      deviceID: deviceID
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'checklogin', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res && res?.isError) {
        this.isOpenCopy = false;
        this.storage.remove('isLogin');
        this.navCtrl.navigateBack('home',{queryParams:{loginError:JSON.stringify(res)}});
        this.dt.detectChanges();
        this.onDestroy();
      }
    })
  }

  onExit(){
    this.cancelExit();
    App.exitApp();
  }

  cancelExit(){
    this.isOpenExit = false;
    this.dt.detectChanges();
  }

  // refreshNoti(){
  //   if (!this.firstLoadNoti) {
  //     this.isloadNoti = true;
  //     this.pageNumNoti = 1;
  //     this.isEmptyNoti = false;
  //     this.loadDataNoti(false);
  //   }
  // }
  //#endregion
}
