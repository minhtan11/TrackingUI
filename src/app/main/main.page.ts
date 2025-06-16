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
import Swiper from 'swiper';
import { ActionPerformed, PushNotificationSchema, PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { App } from '@capacitor/app';
import { PreviousRouterServiceService } from '../previous-router-service/previous-router-service.service';
import { Keyboard } from '@capacitor/keyboard';
import { Badge } from '@capawesome/capacitor-badge';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  //#region Contructor
  @ViewChild(IonContent) content: IonContent;
  isReview:any;
  isOpenCopy:any=false;
  textCopy:any = '';
  selected:any = 0;
  isOpenExit:any=false;
  lastBack:any = Date.now();
  totalPackage:any=0;
  totalOrder:any=0;
  totalNoti:any=0;
  isHideFooter:any = false;
  userName:any;
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
            //dt.detectChanges();
          }
          return;
        }
        if (event && event.urlAfterRedirects.includes('/main/package')) {
          if((!event.urlAfterRedirects.includes('main/package/create')) && (!event.urlAfterRedirects.includes('main/package/detail')) && (!event.urlAfterRedirects.includes('main/package/orderstatus'))){
            if(this.selected != 1){
              this.selected = 1;
              //dt.detectChanges();
            }
            return;
          }
        }
        if (event && event.urlAfterRedirects.includes('/main/order')) {
          if((!event.urlAfterRedirects.includes('main/order/detail'))){
            if(this.selected != 2){
              this.selected = 2;
              //dt.detectChanges();
            }
            return;
          }
        }
        if (event && event.urlAfterRedirects.includes('/main/notification')) {
          if(this.selected != 3){
            this.selected = 3;
            //dt.detectChanges();
          }
          return;
        }
      };
    });
   }
  //#endregion
  
  //#region Init
  async ngOnInit() {
    this.platform.ready().then(async () => {
      this.platform.resume.subscribe(async () => {
        this.getTotalPackage();
        this.getTotalOrder();
        this.getTotalNoti();
        // if (!(this.router.url.includes('/main/package/create'))) {
        //   Clipboard.read().then((clipboardRead: ReadResult) => {
        //     if (clipboardRead?.value) {
        //       let value = clipboardRead?.value;
        //       this.textCopy = value.replace(/(\r\n\s|\r|\n|\s)/g, ',');
        //       this.isOpenCopy = true;
        //       return;
        //     }
        //   });
        // }
      });
    })
    await PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this.getTotalPackage();
        this.getTotalOrder();
        let array = this.router.url.split('?');
        let url = array[0];
        if (!(url.includes('main/notification'))) {
          this.getTotalNoti();
        }
      }
    );
  }

  ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
      
    });
    
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      let array = this.router.url.split('?');
      let url = array[0];
      // if ((url.includes('main/notification'))) {
      //   this.navCtrl.navigateBack('main/mainpage');
      //   return;
      // }
      if((url.includes('main/package'))){
        if((!url.includes('main/package/create')) && (!url.includes('main/package/detail')) && (!url.includes('main/package/orderstatus'))){
          this.navCtrl.navigateBack('main/mainpage');
          return;
        }
      }
      if((url.includes('main/order'))){
        if((!url.includes('main/order/detail'))){
          this.navCtrl.navigateBack('main/mainpage');
          return;
        }
      }
      if((url.includes('main/setting'))){
        if((!url.includes('main/setting/information')) && (!url.includes('main/setting/withdraw')) && (!url.includes('main/setting/changepassword')) && (!url.includes('main/setting/report'))){
          this.navCtrl.navigateBack('main/mainpage');
          return;
        }
      }
      if((url.includes('main/mainpage'))){
        if (Date.now() - this.lastBack < 500) { // logic for double tap: delay of 500ms between two clicks of back button
          this.isOpenExit = true;
        }
        this.lastBack= Date.now();
        return;
      }
      processNextHandler();
    });

    this.api.getTotalPackage().subscribe((res: any) => {
      if (res && res != null) {
        this.getTotalPackage();
      }
    })

    this.api.getTotalOrder().subscribe((res: any) => {
      if (res && res != null) {
        this.getTotalOrder();
      }
    })

    this.api.getTotalNoti().subscribe((res: any) => {
      if (res && res != null) {
        this.getTotalNoti();
      }
    })
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    this.isReview = await this.storage.get('isReview');
    let username = await this.storage.get('username');
    this.userName = username;
    this.routerOutlet.swipeGesture = false; 
    this.getTotalPackage();
    this.getTotalOrder();
    this.getTotalNoti();
  } 
  //#endregion

  //#region Event

  selectedTabChange(event:any){
    let tab = event?.tab.textLabel;
    if (tab) {
      switch(tab){
        case 'home':
          this.navCtrl.navigateForward('main/mainpage');
          this.selected = 0;
          break;
        case 'package':
          this.navCtrl.navigateForward('main/package');
          this.selected = 1;
          
          break;
        case 'order':
          this.navCtrl.navigateForward('main/order');
          this.selected = 2;
          break;
        case 'notification':
          this.navCtrl.navigateForward('main/notification');
          this.selected = 3;
          break;
        case 'setting':
          this.navCtrl.navigateForward('main/setting');
          this.selected = 4;
          break;
      }
      this.content.scrollToTop();
    }
  }
  //#endregion

  //#region Function

  // onCopy(){
  //   this.cancelCopy();
  //   this.navCtrl.navigateForward('main/package/create',{queryParams:{code:this.textCopy}});
  // }

  // cancelCopy(){
  //   this.isOpenCopy = false;
  //   this.dt.detectChanges();
  //   // Clipboard.write({
  //   //   string: ""
  //   // });
    
  // }

  onExit(){
    this.cancelExit();
    App.exitApp();
  }

  cancelExit(){
    this.isOpenExit = false;
    this.dt.detectChanges();
  }

  async getTotalPackage() {
    let username = await this.storage.get('username');
    let data = {
      userName: username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'gettotalpackage', messageBody).subscribe((res: any) => {
      if (res[0]) {
      } else {
        let lst = res[1];
        this.totalPackage = lst.filter((x:any) => x.status == 6).length;
        this.dt.detectChanges();
      }
    })
  }

  async getTotalOrder(){
    let username = await this.storage.get('username');
    let data = {
      userName: username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'gettotalorder', messageBody).subscribe((res:any)=>{
      if (res[0]) {
      } else {
        let lst = res[1];
        this.totalOrder = lst?.filter((x:any) => x.status == 1)?.length;
        this.dt.detectChanges();
      }
    })
  }

  async getTotalNoti(){
    let username = await this.storage.get('username');
    let data = {
      userName: username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'gettotalnotification', messageBody).subscribe(async (res:any)=>{
      if (res[0]) {
      } else {
        this.totalNoti = res[1];
        await Badge.set({ count:this.totalNoti });
        this.dt.detectChanges();
      }
    })
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
