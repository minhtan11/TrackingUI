import { HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonContent, NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-package-page',
  templateUrl: './package-page.component.html',
  styleUrls: ['./package-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagePageComponent  implements OnInit,AfterViewInit {
  //#region Contrucstor
  @ViewChild(IonContent) content: IonContent;
  pageNum:any = 1;
  pageSize:any = 10;
  fromDate:any = null;
  toDate:any = null;
  username:any;
  status:any = 0;
  id:any='';
  lstData:any = [];
  isEmpty:any = false;
  isExec:any=false;
  isloadpage:any=false;
  total:any = 0;
  isload:any=true;
  isnew:any;
  private destroy$ = new Subject<void>();
  constructor(
    private dt : ChangeDetectorRef,
    private api : ApiserviceComponent,
    private rt : ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
  ) { 
  }
  //#endregion

  //#region Init
  ngOnInit() {
  }

  ngAfterViewInit(): void {
    
  }

  async ionViewWillEnter(){
    this.isnew = this.rt.snapshot.queryParams['isnew'];
    if (this.isnew) {
      this.username = await this.storage.get('username');
      this.lstData = [];
      this.pageNum = 1;
      this.isload = true;
      this.isEmpty = false;
      this.isloadpage = true;
      this.dt.detectChanges();
      setTimeout(() => {
        this.loadData();
      }, 500);
      this.content.scrollToTop(); 
    }
  }

  ionViewWillLeave(){
    this.onDestroy();
  }
  //#endregion 

  //#region Function

  trackByFn(index:any, item:any) { 
    return index; 
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  sortData(status:any){
    if(this.status == status) return;
    this.status = status;
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.isExec = true;
    this.dt.detectChanges();
    setTimeout(() => {
      this.loadData();
    }, 500);  
  }

  loadData(){
    let queryParams = new HttpParams();
      queryParams = queryParams.append("status", this.status);
      queryParams = queryParams.append("id", this.id);
      queryParams = queryParams.append("fromDate", this.fromDate);
      queryParams = queryParams.append("toDate", this.toDate);
      queryParams = queryParams.append("pageNum", this.pageNum);
      queryParams = queryParams.append("pageSize", this.pageSize);
      queryParams = queryParams.append("userName", this.username);
      this.api.execByParameter('Authencation', 'package', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          res[0].forEach((data:any) => {
            this.lstData.push(data);
          });
          this.isExec = false;
          this.isloadpage = false;
          if(this.lstData.length == 0) this.isEmpty = true;
          if(this.lstData.length == res[1]) this.isload = false;
          this.dt.detectChanges();
        }
        this.onDestroy();
      })
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
              let index = this.lstData.findIndex((x:any) => x.packageCode == data.packageCode);
              if(index > -1) this.lstData[index] = res[1];
              this.isExec = false;
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
          let index = this.lstData.findIndex((x:any) => x.packageCode == data.packageCode);
          if(index > -1) this.lstData[index] = res[1];
          this.isExec = false;
          this.dt.detectChanges();
          this.navCtrl.navigateForward('main/package/orderstatus/' + this.username, { queryParams: { data: JSON.stringify(res[0]) } });
        }else{
          this.notification.showNotiError('',res.message);
        }
      })
      }, 100);  
    }
  }

  createPackage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/package/create');
  }

  findPackage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/package/find');
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
          this.notification.showNotiError('',res.message);
          let index = this.lstData.findIndex((x:any) => x.packageCode == data.packageCode);
          if(index > -1) this.lstData[index].status = 9;
          this.dt.detectChanges();
          this.onDestroy();
        }else{
          this.notification.showNotiError('',res.message);
          this.onDestroy();
        }
      })
    }, 100);
  }

  onCopy(){
    this.notification.showNotiSuccess('','Đã Sao chép',1000);
  }

  viewDetail(data:any){
    this.navCtrl.navigateForward('main/package/detail',{queryParams:{data:JSON.stringify(data)}});
  }

  onIonInfinite(event:any){ 
    if (this.isload) {
      this.pageNum += 1;
      let queryParams = new HttpParams();
      queryParams = queryParams.append("status", this.status);
      queryParams = queryParams.append("id", this.id);
      queryParams = queryParams.append("fromDate", this.fromDate);
      queryParams = queryParams.append("toDate", this.toDate);
      queryParams = queryParams.append("pageNum", this.pageNum);
      queryParams = queryParams.append("pageSize", this.pageSize);
      queryParams = queryParams.append("userName", this.username);
      this.api.execByParameter('Authencation', 'package', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          res[0].forEach((data:any) => {
            this.lstData.push(data);
          });
          if(this.lstData.length == res[1]) this.isload = false;
        }
        this.onDestroy();
        setTimeout(() => {
          (event as InfiniteScrollCustomEvent).target.complete();
          this.dt.detectChanges();
        }, 500);
      })
    }
  }
  //#endregion
}
