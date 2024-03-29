import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet, NavController, Platform, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { Subject, connect, takeUntil } from 'rxjs';
import { SplashScreen } from '@capacitor/splash-screen';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { Network } from '@capacitor/network';
import { StorageService } from 'src/app/storage-service/storage.service';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent  implements OnInit,AfterViewInit {
  //#region Contrucstor
  oUser:any;
  titleTime:any = '';
  ship1:any;
  ship2:any;
  pack3:any;
  pack5:any;
  isload:any = true;
  isReview:any;
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
    this.isReview = this.rt.snapshot.queryParams["isReview"];
  }
  //#endregion

  //#region Init
  ngOnInit() {
     
  }

  ngAfterViewInit(){
    Network.addListener('networkStatusChange', status => {
      if (status.connected && status.connectionType != 'none') {
        this.getTime();
        this.getUser();
        this.getDashBoard();
      }
      if (!status.connected && status.connectionType == 'none') {}
    });
  }

  async ionViewWillEnter(){
    this.getTime();
    this.getUser();
    this.getDashBoard();
  }

  ionViewDidEnter() {
    this.routerOutlet.swipeGesture = false;
  }

  ionViewWillLeave(){
    this.routerOutlet.swipeGesture = true;
    this.onDestroy();
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Function
  goOrderPage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/order');
  }

  goPackagePage(){
    this.onDestroy();
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

  getTime(){
    let today = new Date()
    let curHr = today.getHours()
    let time = null;

    if (curHr < 12) {
      this.titleTime = "Chào buổi sáng!";
    } else if (curHr < 18) {
      this.titleTime = "Chào buổi chiều!";
    } else {
      this.titleTime = "Chào buổi tối";
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
    this.api.execByBody('Authencation', 'dashboard', messageBody,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
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
