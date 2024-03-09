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
  private destroy$ = new Subject<void>();
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private routerOutlet: IonRouterOutlet
  ) { }

  ngOnInit() {
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    this.getUser();
  }

  ionViewDidEnter() {
    this.routerOutlet.swipeGesture = false;
  }

  ionViewWillLeave(){
    this.routerOutlet.swipeGesture = true;
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
      if (res) {
        this.oUser = res;
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
    Swal.mixin({
      customClass: {
        confirmButton: "btn btn-accent me-2 text-white",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    }).fire({
      title: "",
      text: "Bạn có muốn đăng xuất khỏi tài khoản này?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Từ chối",
      heightAuto: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.storage.remove('password');
        this.navCtrl.navigateBack('home');
      }
    })
  }
}
