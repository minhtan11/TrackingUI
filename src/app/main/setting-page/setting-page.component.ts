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
export class SettingPageComponent  implements OnInit {
  oUser:any;
  isReview:any;
  isOpen:any=false;
  isOpen2:any=false;
  isDismiss:any=false;
  isDismiss2:any=false;
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
    this.getUser();
  }

  ionViewDidEnter() {
    
  }

  ionViewWillLeave(){
    this.onDestroy();
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
      }else{
        this.oUser = res[1];
        this.dt.detectChanges();
      }
    })
  }

  goInformation(){
    this.navCtrl.navigateForward('main/setting/information',{queryParams:{oUser:JSON.stringify(this.oUser)}});
  }

  goWithdraw(type:any){
    this.navCtrl.navigateForward('main/setting/withdraw',{queryParams:{type:type}});
  }

  goChangePassword(){
    this.navCtrl.navigateForward('main/setting/changepassword');
  }

  goSignIn(){
    this.onDismiss2();
    this.storage.remove('password');
    this.navCtrl.navigateBack('home');
  }

  async onDelete() {
    this.onDismiss();
    let username = await this.storage.get('username');
    let data = {
      userName: username,
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
    })
  }
  onOpen(){
    this.isOpen = true;
    this.isDismiss = false;
    this.dt.detectChanges();
  }

  onOpen2(){
    this.isOpen2 = true;
    this.isDismiss2 = false;
    this.dt.detectChanges();
  }

  onDismiss(){
    this.isDismiss = true;
    this.isOpen = false;
    this.dt.detectChanges();
  }
  onDismiss2(){
    this.isDismiss2 = true;
    this.isOpen2 = false;
    this.dt.detectChanges();
  }
}
