import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent  implements OnInit {
  oData:any;
  username:any;
  private destroy$ = new Subject<void>();
  isnew:any = false;
  isExec:any=false;
  constructor(
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
    private api : ApiserviceComponent,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
  ) { 
    this.oData = JSON.parse(this.rt.snapshot.queryParams['data']);
  }

  async ngOnInit() {
    this.username = await this.storage.get('username');
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillLeave(){
    this.onDestroy();
  }

  checkStatus(data: any) {
    if (!data.searchBaiduTimes) {
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-accent me-2 text-white",
          cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
      }).fire({
        title: "Chú ý",
        text: "Sử dụng chức năng này sẽ tốn phí 500đ/kiện (Chỉ tốn phí lần đầu). Bạn có chắc muốn sử dụng?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Từ chối",
        heightAuto: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.isExec = true;
          this.dt.detectChanges();
          setTimeout(() => {
            let queryParams = new HttpParams();
          queryParams = queryParams.append("id", data.packageCode);
          queryParams = queryParams.append("id", this.username);
          this.api.execByParameter('Authencation', 'checkstatus', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
            if (res && !res[0].isError) {
              this.isExec = false;
              this.oData = res[1];
              this.isnew = true;
              this.dt.detectChanges();
              this.navCtrl.navigateForward('main/package/orderstatus/'+this.username,{queryParams:{data:JSON.stringify(res[0])}});
            }else{
              this.notification.showNotiError('',res.message);
            }
          })
          }, 100);
        }
      });
    } else {
      this.isExec = true;
      this.dt.detectChanges();
      setTimeout(() => {
        let queryParams = new HttpParams();
      queryParams = queryParams.append("id", data.packageCode);
      queryParams = queryParams.append("id", this.username);
      this.api.execByParameter('Authencation', 'checkstatus', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res && !res[0].isError) {
          this.isExec = false;
          this.isnew = true;
          this.dt.detectChanges();
          this.oData = res[1];
          this.navCtrl.navigateForward('main/package/orderstatus/' + this.username, { queryParams: { data: JSON.stringify(res[0]) } });
        }else{
          this.notification.showNotiError('',res.message);
        }
      })
      }, 100);
      
    }
  }

  cancelPackage(data:any){
    this.isExec = true;
    this.dt.detectChanges();
    setTimeout(() => {
      let queryParams = new HttpParams();
    queryParams = queryParams.append("id", data.id);
    queryParams = queryParams.append("id", this.username);
    this.api.execByParameter('Authencation', 'cancel', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res.isError) {
        this.isExec = false;
        this.isnew = true;
        this.notification.showNotiError('', res.message);
        this.oData.status = 9;
        this.dt.detectChanges();
      } else {
        this.notification.showNotiError('', res.message);
      }
    })
    }, 100);
  }

  onback(){
    this.navCtrl.navigateForward('main/package',{queryParams:{isnew:this.isnew}});
  }
}
