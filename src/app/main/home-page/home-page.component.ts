import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { IonRouterOutlet, NavController, Platform, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { Subject, connect, takeUntil } from 'rxjs';
import { SplashScreen } from '@capacitor/splash-screen';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { Network } from '@capacitor/network';
import { StorageService } from 'src/app/storage-service/storage.service';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import Swiper from 'swiper';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { Device } from '@capacitor/device';
import { ActionPerformed, PushNotificationSchema, PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Clipboard, ReadResult } from '@capacitor/clipboard';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent{
  //#region Contrucstor
  @ViewChild('swiperRef') swiperRef: ElementRef | undefined;
  swiper:Swiper;
  userName:any;
  ship1:any;
  ship2:any;
  pack3:any;
  pack5:any;
  isReview:any;
  isLoad:any=false;
  animationInProgress = false;
  animation:any;
  lstImgSlide:any;
  imgSticket:any;
  slideIndex:any = 0;
  isPopup:any=false;
  isPopupVersion:any=false;
  imgPopup:any;
  versionNo:any='2.0';
  textCopy:any = '';
  isOpenCopy:any=false;
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
    private routerOutlet: IonRouterOutlet,
    private previous:PreviousRouterServiceService,
    private zone: NgZone,
  ) { 
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {        
        if (event && event.urlAfterRedirects.includes('/main/mainpage')) {
          this.getDashBoard();
          this.startAnimation();
        }else{
          this.swiper = this.swiperRef?.nativeElement?.swiper;
          if (this.swiper) {
            this.swiper?.disable();
          }
          clearTimeout(this.animation);
        }
      };
    });
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
    this.platform.ready().then(async () => {
      let checklogin = this.rt.snapshot.queryParams["checklogin"];
      if (checklogin) {
        this.onCheckLogin(true);
      }else{
        let check = await this.onCheckVersion();
        if (check) {
          this.showBanner(true,1000);
        }
      }
      this.platform.resume.subscribe(async () => {
        this.onCheckLogin();
      });
    })
    this.getSlide();
    // let isload = this.rt.snapshot.queryParams["isload"];
    // if (isload) {
    //   this.api.isLoad2(true);
    //   setTimeout(() => {
    //     this.api.isLoad2(false);
    //   }, 2000);
    // }
    await PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        let oData = notification.notification;
        if (oData && this.isLoad) {
          this.goNotification(oData);
        }
      }
    );
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
    let username = await this.storage.get('username');
    this.userName = username;
    this.animationInProgress = false;
  }

  // showSlides(){
  //   let i;
  //   let slides = document.getElementsByClassName("mySlides");
  //   let dots = document.getElementsByClassName("dot");
  //   if (slides && slides.length > 0) {
  //     for (i = 0; i < slides.length; i++) {
  //       (slides[i] as any).style.display = "none";
  //     }
  //     this.slideIndex++;
  //     if (this.slideIndex > slides.length) { this.slideIndex = 1 }
  //     if (dots && dots.length > 0) {
  //       for (i = 0; i < dots.length; i++) {
  //         dots[i].className = dots[i].className.replace(" active-dots", "");
  //       }
  //     }
  //     (slides[this.slideIndex - 1] as any).style.display = "block";
  //     dots[this.slideIndex - 1].className += " active-dots";
  //   }
  //   setTimeout(() => {
  //     this.showSlides();
  //   }, 4000);
  // }

  ionViewDidLeave(){
    this.cancelPopup();
    this.cancelCopy();
  }

  startAnimation() {
    this.swiper = this.swiperRef?.nativeElement?.swiper;
    if (!this.swiper) {
      this.swiper = this.swiperRef?.nativeElement?.swiper;
    }
    if (this.swiper) {
      this.swiper?.enable();
    }
    this.animation = setTimeout(() => {
      this.swiper?.slideNext(1000);
      this.startAnimation();
    }, 5000)
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
    this.cancelPopup();
    this.navCtrl.navigateForward('main/recharge');
  }

  openPopup(){
    this.isPopup = true;
  }

  async goServicechargePage(){
    let url = await this.storage.get('urlServiceCharge');
    if (url) {
      await Browser.open({ url: url });
    }
    // this.onDestroy();
    // this.navCtrl.navigateForward('main/service-charge');
  }

  goHistoryPage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/history');
  }

  goRegulationsPage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/regulation');
  }

  goCreatePackagePage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/package/create');
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
        
      }
    })
  }
  getSlide(){
    this.api.execByBody('Authencation', 'getslide', null).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(!res[0]){
        this.lstImgSlide = res[1].filter((x:any) => x.imgType == 2);
        this.imgPopup = res[1].filter((x:any) => x.imgType == 3)[0];
        this.imgSticket = res[1].filter((x:any) => x.imgType == 4)[0];
      }else{
      }
    })
  }

  async onCheckLogin(isPopUp:any = false){
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
    this.api.execByBody('Authencation', 'checklogin', messageBody).pipe(takeUntil(this.destroy$)).subscribe(async (res:any)=>{
      if (res && res?.isError) {
        this.storage.remove('isLogin');
        this.navCtrl.navigateBack('home',{queryParams:{loginError:JSON.stringify(res)}});
        this.onDestroy();
      }else{
        if(username != 'admintan'){
          let check = await this.onCheckVersion();
          if (!check) {
            return;
          }
          let data = await this.storage.get('notitap');
          let oData = JSON.parse(data)
          if (data) {
            this.goNotification(oData);
            this.checkCopy();
          }else{
            this.showBanner(isPopUp,3000);
            this.checkCopy();
          }
          this.isLoad = true;
          await this.storage.setAccount(username);
        }
      }
    })
  }

  cancelPopup(){
    this.isPopup = false;
    this.dt.detectChanges();
  }

  goNotification(oData:PushNotificationSchema){
    if (oData.data) {
      let data = JSON.parse(oData.data['data']);
      if (data?.NotifType) {
        switch(data?.notifType){
          case 10:
            this.navCtrl.navigateForward('main/notification');
            break;
          case 1:
            if(data?.OrderCode != '' && data?.OrderCode != null){
              this.navCtrl.navigateForward('main/package/detail', { queryParams: { id: data?.OrderCode } });
            }else{
              this.navCtrl.navigateForward('main/notification');
            }
            break;
          default:
            this.navCtrl.navigateForward('main/notification');
            break;
        }
      }
    }else{
      this.navCtrl.navigateForward('main/notification');
    }
    this.storage.remove('notitap');
  }

  async onCheckVersion(){
    let newVersionNo = await this.storage.get('versionNo');
    if (newVersionNo) {
      if (this.versionNo != newVersionNo) {
        this.isPopupVersion = true;
        this.storage.remove('notitap');
        return false;
      }
    }
    return true;
  }

  showBanner(isPopup:any=true,time:any){
    if (isPopup) {
      setTimeout(() => {
        this.isPopup = true;
      }, time);
    }
  }

  cancelVersion(){
    this.isPopupVersion = false;
    this.dt.detectChanges();
    App.exitApp();
  }

  async updateVersion(){
    this.cancelVersion();
    let platform = await Capacitor.getPlatform();
    switch(platform.toLowerCase()){
      case 'android':
        await Browser.open({ url: 'https://play.google.com/store/apps/details?id=com.trakuaidi.app&hl=vi-VN' });
        //window.open("https://play.google.com/store/apps/details?id=com.trakuaidi.app&hl=vi-VN");
        break;
      case 'ios':
        await Browser.open({ url: 'https://apps.apple.com/vn/app/trakuaidi/id6502419759?l=vi' });
        //window.open("https://apps.apple.com/vn/app/trakuaidi/id6502419759?l=vi");
        break;
    }
    App.exitApp();
  }

  checkCopy(){
    if (!(this.router.url.includes('/main/package/create'))) {
      Clipboard.read().then(async (clipboardRead: ReadResult) => {
        if (clipboardRead?.value) {
          let value = clipboardRead?.value;
          let text = value.replace(/(\r\n\s|\r|\n|\s)/g, ',');
          if (text.length < 100) {
            let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
              '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
              '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
              '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
              '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
              '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
            let arr = text.split(',');
            let newarr:any = [];
            if (arr.length > 0) {
              for (let index = 0; index < arr.length; index++) {
                let value = arr[index];
                if (!pattern.test(value)) {
                  let str = value.substring(3);
                  if (str.length >= 8 && str.length <= 18 && !(isNaN(parseFloat(str)))) {
                    newarr.push(value);
                  }
                }
              }
              if (newarr.length > 0) {
                let newText = newarr.join(',');
                let data = await this.storage.get('lstHistory');
                if (data) {
                  let lstHistory = [];
                  lstHistory = JSON.parse(data);
                  let index = lstHistory.findIndex((x: any) => x.id === newText);
                  if (index > -1) {
                    let obj = lstHistory[index];
                    let now = new Date().toISOString();
                    let exprireDate = Date.parse(obj.exprireTime);
                    if (Date.parse(now) > exprireDate) {
                      lstHistory.splice(index, 1);
                      this.storage.set('lstHistory', JSON.stringify(lstHistory));
                      this.textCopy = newText;
                      this.isOpenCopy = true;
                    }
                  } else {
                    this.textCopy = newText;
                    this.isOpenCopy = true;
                  }
                } else {
                  this.textCopy = newText;
                  this.isOpenCopy = true;
                }
              }
            }
          }
          return;
        }
      });
    }
  }

  onCopy(){
    this.isOpenCopy = false;
    this.dt.detectChanges();
    this.navCtrl.navigateForward('main/package/create',{queryParams:{code:this.textCopy}});
    this.textCopy = '';
    Clipboard.write({string:''});
  }

  async cancelCopy(){
    if (this.textCopy != '' && this.textCopy != null) {
      let now = new Date();
      now.setHours(now.getHours() + 3);
      let lstHistory = [];
      let obj = {
        id: this.textCopy,
        exprireTime: now
      }
      let data = await this.storage.get('lstHistory');
      if (data) {
        lstHistory = JSON.parse(data);
      }
      lstHistory.push(obj);
      this.storage.set('lstHistory', JSON.stringify(lstHistory));
    }
    this.isOpenCopy = false;
    this.dt.detectChanges();
  }
  //#endregion

}
