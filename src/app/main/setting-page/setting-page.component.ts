import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-setting-page',
  templateUrl: './setting-page.component.html',
  styleUrls: ['./setting-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingPageComponent {
  oUser:any;
  isReview:any;
  titleTime:any = '';
  isOpenLogout:any = false;
  isOpenDelete:any = false;
  isOpenSupport:any=false;
  private destroy$ = new Subject<void>();
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private routerOutlet: IonRouterOutlet
  ) { 
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    this.isReview = await this.storage.get('isReview');
    this.getTime();
    this.getUser();
  }

  ionViewDidEnter() {
    
  }

  ionViewWillLeave(){
    this.onDestroy();
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

  goInformation(){
    this.navCtrl.navigateForward('main/setting/information');
  }

  goWithdraw(type:any){
    this.navCtrl.navigateForward('main/setting/withdraw',{queryParams:{type:type}});
  }

  goChangePassword(){
    this.navCtrl.navigateForward('main/setting/changepassword');
  }

  goReport(){
    this.navCtrl.navigateForward('main/setting/report');
  }

  //#region Logout
  onOpenLogout(){
    this.isOpenLogout = true;
  }

  cancelLogout(){
    this.isOpenLogout = false;
    this.dt.detectChanges();
  }

  onLogout(){
    this.cancelLogout();
    let data = {
      userName: this.oUser?.username,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'logoutaccount', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res: any) => {
          if (res && !res?.isError) {
            this.storage.remove('isLogin');
            this.navCtrl.navigateBack('home');
          } else {
            this.notification.showNotiError('', res?.message);
          }
        },
        complete:()=>{
          this.api.isLoad(false);
          this.onDestroy();
        }
      })
    }, 500);
  }
  //#endregion

  //#region delete account
  onOpenDelete(){
    this.isOpenDelete = true;
  }

  cancelDelete(){
    this.isOpenDelete = false;
    this.dt.detectChanges();
  }

  onDelete() {
    this.cancelDelete();
    let data = {
      userName: this.oUser?.username,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'deleteaccount', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res: any) => {
          if (res && !res?.isError) {
            this.notification.showNotiSuccess('', res?.message);
            this.storage.remove('username');
            this.storage.remove('password');
            this.navCtrl.navigateBack('home');
          } else {
            this.notification.showNotiError('', res?.message);
          }
        },
        complete:()=>{
          this.api.isLoad(false);
          this.onDestroy();
        }
      })
    }, 500);
  }
  //#endregion

  //#region support
  onOpenSupport(){
    this.isOpenSupport = true;
  }

  cancelSupport(){
    this.isOpenSupport = false;
    this.dt.detectChanges();
  }

  goZalo(){
    this.cancelSupport();
    window.open("http://zalo.me/1977119545826967396?src=qr")
  }

  goPhone(){
    this.cancelSupport();
    window.open("tel:+84911233488");
  }
  //#endregion
}
