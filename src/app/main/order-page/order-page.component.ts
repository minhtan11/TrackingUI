import { HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { InfiniteScrollCustomEvent, IonContent, NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPageComponent  implements OnInit,AfterViewInit {
  //#region Contrucstor
  @ViewChild(IonContent) content: IonContent;
  pageNum:any = 1;
  pageSize:any = 50;
  fromDate:any = null;
  toDate:any = null;
  username:any;
  status:any = 0;
  id:any='';
  lstData:any = [];
  isEmpty:any = false;
  isload:any=true;
  isconnected:any = true;
  itemSelected:any;
  isOpenPayment:any = false;
  private destroy$ = new Subject<void>();
  constructor(
    private dt : ChangeDetectorRef,
    private api : ApiserviceComponent,
    private rt : ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private platform: Platform,
    private router: Router,
  ) { 
  }
  //#endregion

  //#region Init

  ngOnInit() {
    
  }

  async ionViewWillEnter(){
    let status = this.rt.snapshot.queryParams["status"];
    if (status) {
      this.status = status;
      this.dt.detectChanges();
    }
    this.init();
    this.dt.detectChanges();
  }

  ngAfterViewInit() {
    // Network.addListener('networkStatusChange', status => {
    //   this.isconnected = status.connected;
    //   if (status.connected && status.connectionType != 'none') {
    //     this.isloadpage = true;
    //     this.dt.detectChanges();
    //     setTimeout(() => {
    //       this.loadData();
    //     }, 500);  
    //   }
    //   if (!status.connected && status.connectionType == 'none') {
    //     this.lstData = [];
    //     this.isload = true;
    //     this.pageNum = 1;
    //     this.isEmpty = false;
    //     this.dt.detectChanges();
    //   }
    // });
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillLeave(){
    this.onDestroy();
  }
  //#endregion

  //#region Function

  // findOrder(){
  //   this.navCtrl.navigateForward('main/order/find');
  // }

  trackByFn(index:any, item:any) { 
    return index; 
  }

  sortData(status:any){
    if(this.status == status) return;
    this.status = status;
    if(!this.isconnected) return;
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.dt.detectChanges();
    this.loadData();
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
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'order', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res: any) => {
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            let oData = res[1];
            this.lstData = oData[0];
            if (this.lstData.length == 0) this.isEmpty = true;
            if (this.lstData.length == oData[1]) this.isload = false;
            this.dt.detectChanges();
          }
        },
        complete:()=>{
          this.api.isLoad(false);
        }
      })
    }, 1000);
  }

  viewDetail(data:any){
    this.navCtrl.navigateForward('main/order/detail',{queryParams:{data:JSON.stringify(data)}});
  }

  onback(){
    this.navCtrl.navigateBack('main',{queryParams:{selected:0}});
  }

  onCopy(){
    this.notification.showNotiSuccess('','Đã Sao chép',1000);
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
      this.api.execByBody('Authencation', 'order', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
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

  ionChange(event:any){
    this.id = event?.detail?.value;
    if(this.id == null || this.id == '') this.id = '';
    this.lstData = [];
    this.pageNum = 1;
    this.isload = true;
    this.isEmpty = false;
    this.lstData = [];
    this.content.scrollToTop();
    this.loadData();
  }

  async init(){
    if(!this.username) this.username = await this.storage.get('username');
    let type = this.rt.snapshot.queryParams['type'];
    switch(type){
      case 'change':
        let data = JSON.parse(this.rt.snapshot.queryParams['dataUpdate']);
        if(data){
          let index = this.lstData.findIndex((x:any) => x.id == data.id);
          if(index > -1){
            this.lstData[index] = data;
            this.dt.detectChanges();
          } 
        }
        break;
      default:
        if (this.lstData && this.lstData.length == 0) {
          this.isload = true;
          this.pageNum = 1;
          this.isEmpty = false;
          this.loadData();
        }
        break;
    }
  }

  openPayment(item:any){
    this.itemSelected = {...item};
    this.isOpenPayment = true;
  }

  cancelPayment(){
    this.isOpenPayment = false;
    this.dt.detectChanges();
  }

  onPayment(item:any){
    this.cancelPayment();
    let data = {
      id: item.id,
      userName: this.username,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'payment', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res && !res.isError) {
            this.notification.showNotiSuccess('',res.message);
            if(res?.data){
              let index = this.lstData.findIndex((x: any) => x.id == res?.data?.id);
                if (index > -1) {
                  this.lstData[index] = res?.data;
                  this.dt.detectChanges();
                } 
            }
          }else{
            this.notification.showNotiError('',res.message);
          }
        },
        complete:()=>{
          this.api.isLoad(false);
          this.onDestroy();
        }
      })
    }, 1000);
  }

  //#endregion
}
