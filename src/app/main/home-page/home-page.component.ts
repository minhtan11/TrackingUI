import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { SplashScreen } from '@capacitor/splash-screen';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { Network } from '@capacitor/network';
import { StorageService } from 'src/app/storage-service/storage.service';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';

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
  ) { 
  }
  //#endregion

  //#region Init
  ngOnInit() {
    this.getTime();
    this.getUser();
    this.getDashBoard();
  }

  ngAfterViewInit(){
    // Network.addListener('networkStatusChange', status => {
    //   console.log('Network status changed', status);
    // });
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Function
  goOrderPage(){
    this.navCtrl.navigateForward('main/order/'+this.oUser.username);
  }

  goPackagePage(){
    this.navCtrl.navigateForward('main/package');
  }

  goRechargePage(){
    this.router.navigate(['main/recharge']);
  }

  goServicechargePage(){
    this.router.navigate(['main/service-charge']);
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
    let password = await this.storage.get('password');
    if (username && password) {
      let queryParams = new HttpParams();
      queryParams = queryParams.append("userName", username);
      queryParams = queryParams.append("passWord", password);
      this.api.execByParameter('Authencation', 'login', queryParams,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res && !res?.isError) {
          this.storage.remove('oUser');
          this.storage.set('oUser',JSON.stringify(res.data));
          this.oUser = res.data;
          this.dt.detectChanges();
        } else {
          this.notification.showNotiError('','Tài khoản đã bị xóa hoặc không hợp lệ');
        }
      })
    }
  }

  async getDashBoard(){
    let username = await this.storage.get('username');
    let queryParams = new HttpParams();
    queryParams = queryParams.append("userName", username);
    this.api.execByParameter('Authencation', 'dashboard', queryParams,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.pack3 = res[0][0];
        this.pack5 = res[0][2];
        this.ship1 = res[1][0];
        this.ship2 = res[1][1];
        this.dt.detectChanges();
      }
    })
  }
  //#endregion

}
