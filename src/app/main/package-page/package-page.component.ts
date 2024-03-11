import { HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonContent, IonSegment, IonSegmentButton, NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import Swal from 'sweetalert2';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

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
  pageSize:any = 50;
  fromDate:any = '';
  toDate:any = '';
  username:any;
  status:any = 0;
  id:any='';
  lstData:any = [];
  isEmpty:any = false;
  isloadpage:any=false;
  total:any = 0;
  isload:any=true;
  isconnected:any = true;
  platform:any = "";
  private destroy$ = new Subject<void>();
  constructor(
    private dt : ChangeDetectorRef,
    private api : ApiserviceComponent,
    private rt : ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
  ) { 
    this.platform = Capacitor.getPlatform();
  }
  //#endregion

  //#region Init
  ngOnInit() {
    
  }

  ngAfterViewInit(){
    Network.addListener('networkStatusChange', status => {
      this.isconnected = status.connected;
      if (status.connected && status.connectionType != 'none') {
        this.isloadpage = true;
        this.dt.detectChanges();
        setTimeout(() => {
          this.loadData();
        }, 500);  
      }
      if (!status.connected && status.connectionType == 'none') {
        this.lstData = [];
        this.isload = true;
        this.pageNum = 1;
        this.isEmpty = false;
        this.dt.detectChanges();
      }
    });
  }

  async ionViewWillEnter(){
    this.init();
    this.dt.detectChanges();
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
    if(!this.isconnected) return;
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.isloadpage = true;
    this.dt.detectChanges();
    setTimeout(() => {
      this.loadData();
    }, 500);  
  }

  loadData(){
    let data = {
      status: this.status,
      id: this.id,
      //fromDate: this.fromDate,
      //toDate: this.toDate,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'package', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      }else{
        let oData = res[1];
        this.lstData = oData[0];
        this.isloadpage = false;
        if (this.lstData.length == 0) this.isEmpty = true;
        if (this.lstData.length == oData[1]) this.isload = false;
        this.dt.detectChanges();
      }
    })
  }

  // checkStatus(data: any) {
  //   if (!data.searchBaiduTimes) {
  //     Swal.mixin({
  //       customClass: {
  //         confirmButton: "btn btn-accent me-2 text-white",
  //         cancelButton: "btn btn-danger"
  //       },
  //       buttonsStyling: false
  //     }).fire({
  //       title: "Chú ý",
  //       text: "Sử dụng chức năng này sẽ tốn phí 500đ/kiện (Chỉ tốn phí lần đầu). Bạn có chắc muốn sử dụng?",
  //       icon: "warning",
  //       showCancelButton: true,
  //       cancelButtonColor: "#d33",
  //       confirmButtonText: "Đồng ý",
  //       cancelButtonText: "Từ chối",
  //       heightAuto: false
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         let queryParams = new HttpParams();
  //         queryParams = queryParams.append("id", data.packageCode);
  //         queryParams = queryParams.append("userName", this.username);
  //         this.api.execByParameter('Authencation', 'checkstatus', queryParams,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
  //           if (res && !res[0].isError) {
  //             let index = this.lstData.findIndex((x:any) => x.packageCode == data.packageCode);
  //             if(index > -1) this.lstData[index] = res[1];
  //             this.dt.detectChanges();
  //             this.navCtrl.navigateForward('main/package/orderstatus/' + this.username, { queryParams: { result: JSON.stringify(res[0]),data:JSON.stringify(res[1])}});
  //           }else{
  //             this.notification.showNotiError('',res.message);
  //           }
  //         })
  //       }
  //     });
  //   } else {
  //     let queryParams = new HttpParams();
  //     queryParams = queryParams.append("id", data.packageCode);
  //     queryParams = queryParams.append("userName", this.username);
  //     this.api.execByParameter('Authencation', 'checkstatus', queryParams,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
  //       if (res && !res[0].isError) {
  //         let index = this.lstData.findIndex((x:any) => x.packageCode == data.packageCode);
  //         if(index > -1) this.lstData[index] = res[1];
  //         this.dt.detectChanges();
  //         this.navCtrl.navigateForward('main/package/orderstatus/' + this.username, { queryParams: { result: JSON.stringify(res[0]),data:JSON.stringify(res[1])}});
  //       }else{
  //         this.notification.showNotiError('',res.message);
  //       }
  //     })
  //   }
  // }

  createPackage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/package/create');
  }

  // findPackage(){
  //   this.onDestroy();
  //   this.navCtrl.navigateForward('main/package/find');
  // }

  // cancelPackage(data:any){
  //   let queryParams = new HttpParams();
  //   queryParams = queryParams.append("id", data.id);
  //   queryParams = queryParams.append("userName", this.username);
  //   this.api.execByParameter('Authencation', 'cancel', queryParams,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
  //     if (res && !res[0].isError) {
  //       this.notification.showNotiSuccess('', res[0].message);
  //       let index = this.lstData.findIndex((x: any) => x.packageCode == data.packageCode);
  //       if (index > -1) this.lstData[index] = res[1];
  //       this.dt.detectChanges();
  //     } else {
  //       this.notification.showNotiError('', res[0].message);
  //     }
  //   })
  // }

  onCopy(){
    this.notification.showNotiSuccess('','Đã Sao chép',1000);
  }

  viewDetail(data:any){
    this.navCtrl.navigateForward('main/package/detail',{queryParams:{data:JSON.stringify(data)}});
  }

  onIonInfinite(event:any){ 
    if (this.isload) {
      this.pageNum += 1;
      let data = {
        status: this.status,
        id: this.id,
        //fromDate: this.fromDate,
        //toDate: this.toDate,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        userName: this.username
      }
      let messageBody = {
        dataRequest: JSON.stringify(data)
      };
      this.api.execByBody('Authencation', 'package', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
        }else{
          let oData = res[1];
          oData[0].forEach((data:any) => {
            this.lstData.push(data);
          });
          if(this.lstData.length == oData[1]) this.isload = false;
          this.onDestroy();
          setTimeout(() => {
            (event as InfiniteScrollCustomEvent).target.complete();
            this.dt.detectChanges();
          }, 500);
        }
      })
    }
  }

  onback(){
    this.navCtrl.navigateBack('main');
  }

  ionChange(event:any){
    this.id = event?.detail?.value;
    if(this.id == null || this.id == '') this.id = '';
    this.lstData = [];
    this.pageNum = 1;
    this.isload = true;
    this.isEmpty = false;
    this.isloadpage = false;
    this.lstData = [];
    this.content.scrollToTop();
    this.loadData();
  }

  async init(){
    if(!this.username) this.username = await this.storage.get('username');
    let type = this.rt.snapshot.queryParams['type'];
    switch(type){
      case 'addnew':
        this.pageNum = 1;
        this.status = 0;
        this.isload = true;
        this.isEmpty = false;
        this.isloadpage = false;
        this.lstData = [];
        this.content.scrollToTop();
        this.loadData();
        break;
      case 'change':
        let array = JSON.parse(this.rt.snapshot.queryParams['lstdata']);
        array.forEach((item:any) => {
          let index = this.lstData.findIndex((x:any) => x.packageCode == item.packageCode);
          if(index > -1) this.lstData[index] = item;
        });
        this.dt.detectChanges();
        break;
      case 'default':
        break;
      default:
        this.lstData = [];
        this.isloadpage = true;
        this.dt.detectChanges();
        setTimeout(() => {
          this.loadData();
        }, 500);
        break;
    }
  }
  //#endregion
}
