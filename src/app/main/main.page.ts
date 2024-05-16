import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonRouterOutlet, IonTabs, NavController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StorageService } from '../storage-service/storage.service';
import { Clipboard, ReadResult } from '@capacitor/clipboard';
import { ApiserviceComponent } from '../apiservice/apiservice.component';
import { Subject, takeUntil } from 'rxjs';
import { Device } from '@capacitor/device';
import { NotificationServiceComponent } from '../notification-service/notification-service.component';
import { register } from 'swiper/element/bundle';
import Swiper from 'swiper';
register();

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage implements OnInit,AfterViewInit {
  //#region Contructor
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper:Swiper;
  isReview:any;
  isOpen:any=false;
  isDismiss:any=false;
  textCopy:any = '';
  selected:any = 0;
  headerText:any = 'Trang chủ';
  pageSize: any = 50;
  animationInProgress = false;
  

  // home
  oUser:any;
  titleTime:any = '';
  ship1:any;
  ship2:any;
  pack3:any;
  pack5:any;

  // history
  lstDataHistory: any;
  pageNumHis: any = 1;
  fromDateHis: any = null;
  toDateHis: any = null;
  statusHis: any = 0;
  idHis: any;
  isEmptyHis: any = false;
  isloadHis: any = true;
  firstLoadHis:any = true;

  //notification
  lstDataNoti: any;
  pageNumNoti: any = 1;
  fromDateNoti: any = null;
  toDateNoti: any = null;
  statusNoti: any = -1;
  idNoti: any;
  isEmptyNoti: any = false;
  isloadNoti: any = true;
  firstLoadNoti:any = true;

  // setting
  isOpenPopup1:any=false;
  isOpenPopup2:any=false;
  isDismissPopup1:any=false;
  isDismissPopup2:any=false;

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
    private router: Router,
  ) {
    this.isReview = this.rt.snapshot.queryParams["isReview"];
   }
  //#endregion
  
  //#region Init
  ngOnInit() {
    this.getTime();
    this.getUser();
    this.getDashBoard();
    this.platform.ready().then(async () => {
      let checklogin = this.rt.snapshot.queryParams["checklogin"];
      if (checklogin) {
        this.onCheckLogin();
      }
      this.platform.resume.subscribe(async () => {
        this.onCheckLogin();
        Clipboard.read().then((clipboardRead: ReadResult) => {
          if (clipboardRead?.value) {
            this.isOpen = true;
            this.isDismiss = false;
            let value = clipboardRead?.value;
            this.textCopy = value.replace(/(\r\n\s|\r|\n|\s)/g, ',');
            this.dt.detectChanges();
            return;
          }
        });
      });
    })
  }

  ngAfterViewInit() {
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    this.isReview = await this.storage.get('isReview');
    this.dt.detectChanges();
    let selected = this.rt.snapshot.queryParams["selected"];
    if (selected != null) {
      this.selected = selected;
      switch(selected){
        case 0:
          this.getUser();
          break;
      }
      this.dt.detectChanges();
    }
    this.routerOutlet.swipeGesture = false; 
    this.swiper = this.swiperRef?.nativeElement.swiper;
    if(this.swiper){
      this.swiper.enable();
      this.swiper.init();
    } 
    this.startAnimation();
  }

  startAnimation() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
    if(this.animationInProgress) return;
    this.animationInProgress = true;
    setTimeout(() => {
      if (this.swiper) {
        this.swiper.slideNext(1000,false);
      }
      this.animationInProgress = false;
      this.startAnimation();
    }, 5000);
  }
  //#endregion

  //#region Event
  selectedTabChange(event:any){
    let tab = event?.tab.textLabel;
    if (tab) {
      switch(tab){
        case 'home':
          this.selected = 0;
          this.headerText = 'Trang chủ';
          this.swiper = this.swiperRef?.nativeElement.swiper;
          if(this.swiper){
            this.swiper.enable();
            this.swiper.init();
            this.startAnimation();
          } 
          break;
        case 'history':
          this.selected = 1;
          this.headerText = 'Lịch sử giao dịch';
          this.initHis();
          this.swiper = this.swiperRef?.nativeElement.swiper;
          if(this.swiper) this.swiper.disable();
          break;
        case 'notification':
          this.selected = 2;
          this.headerText = 'Thông báo';
          this.initNoti();
          if(this.swiper) this.swiper.disable();
          break;
        case 'setting':
          this.selected = 3;
          this.headerText = 'Tài khoản';
          if(this.swiper) this.swiper.disable();
          break;
      }
    }
    this.dt.detectChanges();
  }
  //#endregion

  //#region Function
  
  //#region HomePage

  getTime(){
    let today = new Date()
    let curHr = today.getHours()
    let time = null;

    if (curHr < 12) {
      this.titleTime = "Chào buổi sáng!";
    } else if (curHr < 18) {
      this.titleTime = "Chào buổi chiều!";
    } else {
      this.titleTime = "Chào buổi tối!";
    }
    this.dt.detectChanges();
  }

  async getUser(){
    let username = await this.storage.get('username');
    let data = {
      userName:username,
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'getuser', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
        this.storage.remove('password');
        this.navCtrl.navigateBack('home');
      }else{
        this.oUser = res[1];
        this.dt.detectChanges();
      }
    })
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

  goOrderPage(status:any=''){
    if (status) {
      this.navCtrl.navigateForward('main/order',{animated:false,queryParams:{status:status}});
      return;
    }
    this.navCtrl.navigateForward('main/order',{animated:false});
    if(this.swiper) this.swiper.disable();
    this.onDestroy();
  }

  goPackagePage(status:any=''){
    if (status) {
      this.navCtrl.navigateForward('main/package',{animated:false,queryParams:{status:status}});
      return;
    }
    this.navCtrl.navigateForward('main/package',{animated:false,queryParams:{type:'default'}});
    if(this.swiper) this.swiper.disable();
    this.onDestroy();
  }

  goRechargePage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/recharge',{animated:false});
    if(this.swiper) this.swiper.disable();
  }

  goServicechargePage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/service-charge',{animated:false});
    if(this.swiper) this.swiper.disable();
  }
  //#endregion

  //#region History
  initHis(){
    if(!this.firstLoadHis) return;
    this.lstDataHistory = [];
    this.dt.detectChanges();
    this.loadDataHis();
  }

  loadDataHis(){
    let data = {
      status: this.statusHis,
      id: this.idHis,
      //fromDate: this.fromDate,
      //toDate: this.toDate,
      pageNum: this.pageNumHis,
      pageSize: this.pageSize,
      userName: this.oUser?.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'historywallet', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res: any) => {
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            let oData = res[1];
            this.lstDataHistory = oData[0];
            if (this.lstDataHistory.length == 0) this.isEmptyHis = true;
            if (this.lstDataHistory.length == oData[1]) this.isloadHis = false;
            if(this.firstLoadHis) this.firstLoadHis = false;
          }
        },
        complete:()=>{
          this.dt.detectChanges();
          this.api.isLoad(false);
        }
      })
    }, 1000);
  }

  sortDataHis(status: any) {
    if(this.statusHis == status) return;
    this.statusHis = status;
    this.isloadHis = true;
    this.pageNumHis = 1;
    this.lstDataHistory = [];
    this.isEmptyHis = false;
    this.dt.detectChanges();
    this.loadDataHis();
  }

  onIonInfiniteHis(event: any) {
    if (this.isloadHis) {
      this.pageNumHis += 1;
      let data = {
        status: this.statusHis,
        id: this.idHis,
        //fromDate: this.fromDate,
        //toDate: this.toDate,
        pageNum: this.pageNumHis,
        pageSize: this.pageSize,
        userName: this.oUser?.username
      }
      let messageBody = {
        dataRequest: JSON.stringify(data)
      };
      this.api.execByBody('Authencation', 'historywallet', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
        }else{
          let oData = res[1];
          oData[0].forEach((data:any) => {
            this.lstDataHistory.push(data);
          });
          if(this.lstDataHistory.length == oData[1]) this.isloadHis = false;
          this.onDestroy();
          setTimeout(() => {
            (event as InfiniteScrollCustomEvent).target.complete();
            this.dt.detectChanges();
          }, 500);
        }
      })
    }
  }
  //#endregion

  //#region Notification
  initNoti(){
    if(!this.firstLoadNoti) return;
    this.lstDataNoti = [];
    this.dt.detectChanges();
    this.loadDataNoti();
  }

  loadDataNoti(){
    let data = {
      status: this.statusNoti,
      //fromDate: this.fromDate,
      //toDate: this.toDate,
      pageNum: this.pageNumNoti,
      pageSize: this.pageSize,
      userName: this.oUser?.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'notification', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res: any) => {
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            let oData = res[1];
            this.lstDataNoti = oData[0];
            if (this.lstDataNoti.length == 0) this.isEmptyNoti = true;
            if (this.lstDataNoti.length == oData[1]) this.isloadNoti = false;
            if(this.firstLoadNoti) this.firstLoadNoti = false;
          }
        },
        complete:()=>{
          this.api.isLoad(false);
          this.dt.detectChanges();
        }
      })
    }, 1000);
  }

  onIonInfiniteNoti(event: any) {
    if (this.isloadNoti) {
      this.pageNumNoti += 1;
      let data = {
        status: this.statusNoti,
        //fromDate: this.fromDate,
        //toDate: this.toDate,
        pageNum: this.pageNumNoti,
        pageSize: this.pageSize,
        userName: this.oUser?.username
      }
      let messageBody = {
        dataRequest: JSON.stringify(data)
      };
      this.api.execByBody('Authencation', 'notification', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
        }else{
          let oData = res[1];
          oData[0].forEach((data:any) => {
            this.lstDataNoti.push(data);
          });
          if(this.lstDataNoti.length == oData[1]) this.isloadNoti = false;
          this.onDestroy();
          setTimeout(() => {
            (event as InfiniteScrollCustomEvent).target.complete();
            this.dt.detectChanges();
          }, 500);
        }
      })
    }
  }
  //#endregion
  
  //#region Setting
  goInformation(){
    this.navCtrl.navigateForward('main/setting/information');
  }

  goWithdraw(type:any){
    this.navCtrl.navigateForward('main/setting/withdraw',{queryParams:{type:type}});
  }

  goChangePassword(){
    this.navCtrl.navigateForward('main/setting/changepassword');
  }

  goSignIn(){
    this.onDismiss2();
    this.storage.remove('isLogin');
    this.navCtrl.navigateBack('home');
  }

  onDelete() {
    this.onDismiss();
    let data = {
      userName: this.oUser?.username,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'deleteaccount', messageBody, true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.isError) {
        this.notification.showNotiSuccess('', res?.message);
        this.storage.remove('username');
        this.storage.remove('password');
        this.navCtrl.navigateBack('home');
      } else {
        this.notification.showNotiError('', res?.message);
      }
      this.onDestroy();
    })
  }
  onOpen(){
    this.isOpenPopup1 = true;
    this.isDismissPopup1 = false;
    this.dt.detectChanges();
  }

  onOpen2(){
    this.isOpenPopup2 = true;
    this.isDismissPopup2 = false;
    this.dt.detectChanges();
  }

  onDismiss(){
    this.isDismissPopup1 = true;
    this.isOpenPopup1 = false;
    this.dt.detectChanges();
  }
  onDismiss2(){
    this.isDismissPopup2 = true;
    this.isOpenPopup2 = false;
    this.dt.detectChanges();
  }
  //#endregion
  onAccept(){
    this.onCancel();
    this.navCtrl.navigateForward('main/package/create',{queryParams:{code:this.textCopy}});
  }

  onCancel(){
    this.isDismiss = true;
    this.isOpen = false;
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
        this.isOpen = false;
        this.isDismiss = false;
        this.storage.remove('isLogin');
        this.navCtrl.navigateBack('home',{queryParams:{loginError:JSON.stringify(res)}});
        this.dt.detectChanges();
        this.onDestroy();
      }
    })
  }

  onRefresh(event:any){
    switch(this.selected){
      case 0:
      case 3:
        this.getUser();
        this.getDashBoard();
        break;
      case 1:
        this.pageNumHis = 1;
        this.isEmptyHis = false;
        this.isloadHis = true;
        this.loadDataHis();
        break;
      case 2:
        this.pageNumNoti = 1;
        this.isEmptyNoti = false;
        this.isloadNoti = true;
        this.loadDataNoti();
        break;
    }
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  // trackByFn(index: any, item: any) {
  //   return index;
  // }
  //#endregion
}
