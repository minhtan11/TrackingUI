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
  isExec:any=false;
  arrayChange:any=[];
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

  ionViewWillEnter(){
    this.arrayChange = [];
  }

  ionViewWillLeave(){
    this.arrayChange = [];
    this.onDestroy();
  }

  checkStatus(item: any) {
    if (!item.searchBaiduTimes) {
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
            let data = {
              id: item.packageCode,
              userName: this.username
            }
            let messageBody = {
              dataRequest: JSON.stringify(data)
            };
            this.api.execByBody('Authencation', 'checkstatus', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
              if (res[0]) {
                this.notification.showNotiError('', res[1].message);
              }else{
                if (!res[1].isError) {
                  this.isExec = false;
                  this.dt.detectChanges();
                  this.navCtrl.navigateForward('main/package/orderstatus/' + this.username, { queryParams: { result: JSON.stringify(res[1]), data: JSON.stringify(res[2]) } });
                } else {
                  this.notification.showNotiError('', res[1].message);
                }
              }
            })
          }, 100);
        }
      });
    } else {
      this.isExec = true;
      this.dt.detectChanges();
      setTimeout(() => {
        let data = {
          id: item.packageCode,
          userName: this.username
        }
        let messageBody = {
          dataRequest: JSON.stringify(data)
        };
        this.api.execByBody('Authencation', 'checkstatus', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            if (!res[1].isError) {
              this.isExec = false;
              this.dt.detectChanges();
              this.navCtrl.navigateForward('main/package/orderstatus/' + this.username, { queryParams: { result: JSON.stringify(res[1]), data: JSON.stringify(res[2]) } });
            } else {
              this.notification.showNotiError('', res[1].message);
            }
          }
        })
      }, 100);  
    }
  }

  cancelPackage(item:any){
    this.isExec = true;
    this.dt.detectChanges();
    setTimeout(() => {
      let data = {
        id: item.id,
        userName: this.username
      }
      let messageBody = {
        dataRequest: JSON.stringify(data)
      };
      this.api.execByBody('Authencation', 'cancel', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
        }else{
          if (!res[1].isError) {
            this.isExec = false;
            this.notification.showNotiSuccess('', res[1].message);
            this.oData = res[2];
            //push data array change
            this.arrayChange.push(res[2]);
            this.dt.detectChanges();
          } else {
            this.notification.showNotiError('', res[1].message);
          }
        }
      })
    }, 100);
  }

  onback(){
    if (this.arrayChange.length) {
      this.navCtrl.navigateBack('main/package',{queryParams:{type:'change',lstdata:JSON.stringify(this.arrayChange)}});
    }else{
      this.navCtrl.navigateBack('main/package',{queryParams:{type:'default'}});
    }
  }
}
