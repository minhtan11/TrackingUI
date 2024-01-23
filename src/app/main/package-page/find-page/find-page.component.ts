import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-find-page',
  templateUrl: './find-page.component.html',
  styleUrls: ['./find-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindPageComponent  implements OnInit {
  //#region Constructor
  @ViewChild(IonContent) content: IonContent;
  formGroup!: FormGroup;
  status:any = 0;
  lstData:any = [];
  pageNum:any = 1;
  pageSize:any = 10;
  username:any;
  isEmpty:any = true;
  isload:any=true;
  isExec:any=false;
  id:any='';
  arrayChange:any=[];
  private destroy$ = new Subject<void>();
  constructor(
    private api: ApiserviceComponent,
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
    private navCtrl: NavController,
    private notification: NotificationServiceComponent,
    private storage: StorageService,
  ) { 
    this.username = this.rt.snapshot.params['username'];
  }
  //#endregion

  //#region Init

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

  //#endregion

  //#region Functione
  loadData(){
    let queryParams = new HttpParams();
      queryParams = queryParams.append("status", this.status);
      queryParams = queryParams.append("id", this.id);
      queryParams = queryParams.append("fromDate", '');
      queryParams = queryParams.append("toDate", '');
      queryParams = queryParams.append("pageNum", this.pageNum);
      queryParams = queryParams.append("pageSize", this.pageSize);
      queryParams = queryParams.append("userName", this.username);
      this.api.execByParameter('Authencation', 'package', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          res[0].forEach((data:any) => {
            this.lstData.push(data);
          });
          this.isEmpty = false;
          if(this.lstData.length == 0) this.isEmpty = true;
          if(this.lstData.length == res[1]) this.isload = false;
          this.dt.detectChanges();
        }
      })
  }

  async loadPage(event:any){
    let scrollElement = await this.content.getScrollElement();
    if ((scrollElement.scrollTop === scrollElement.scrollHeight - scrollElement.clientHeight) && scrollElement.scrollTop != 0) {
      if(this.isload){
        this.pageNum += 1;
        this.loadData();
      }
    }
  }

  trackByFn(index:any, item:any) { 
    return index; 
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
            queryParams = queryParams.append("userName", this.username);
            this.api.execByParameter('Authencation', 'checkstatus', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
              if (res && !res[0].isError) {
                this.isExec = false;
                this.dt.detectChanges();
                this.navCtrl.navigateForward('main/package/orderstatus/' + this.username, { queryParams: { result: JSON.stringify(res[0]),data:JSON.stringify(res[1])}});
              } else {
                this.isExec = false;
                this.notification.showNotiError('', res.message);
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
        queryParams = queryParams.append("userName", this.username);
        this.api.execByParameter('Authencation', 'checkstatus', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
          if (res && !res[0].isError) {
            this.isExec = false;
            this.dt.detectChanges();
            this.navCtrl.navigateForward('main/package/orderstatus/' + this.username, { queryParams: { result: JSON.stringify(res[0]),data:JSON.stringify(res[1])}});
          } else {
            this.notification.showNotiError('', res.message);
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
      queryParams = queryParams.append("userName", this.username);
      this.api.execByParameter('Authencation', 'cancel', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res && !res[0].isError) {
          this.isExec = false;
          this.notification.showNotiSuccess('', res[0].message);
          let index = this.lstData.findIndex((x: any) => x.packageCode == data.packageCode);
          if (index > -1) this.lstData[index] = res[1];
          //push data array change
          this.arrayChange.push(res[1]);
          this.dt.detectChanges();
        } else {
          this.notification.showNotiError('', res[0].message);
        }
      })
    }, 100);
  }

  ionChange(event:any){
    this.id = event?.detail?.value || event?.detail;
    if(this.id == null || this.id == ''){
      this.lstData = [];
      this.dt.detectChanges();
    }else{
      this.lstData = [];
      this.loadData();
    }
  }

  viewDetail(data:any){
    this.navCtrl.navigateForward('main/package/detail',{queryParams:{data:JSON.stringify(data)}});
  }

  onback(){
    if (this.arrayChange.length) {
      this.navCtrl.navigateForward('main/package',{queryParams:{type:'change',lstdata:JSON.stringify(this.arrayChange)}});
    }else{
      this.navCtrl.navigateForward('main/package');
    }
  }
  //#endregion
}
