import { HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Network } from '@capacitor/network';
import { InfiniteScrollCustomEvent, IonContent, NavController } from '@ionic/angular';
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
  pageSize:any = 20;
  fromDate:any = null;
  toDate:any = null;
  username:any;
  status:any = 0;
  id:any='';
  lstData:any = [];
  isEmpty:any = false;
  isload:any=true;
  isloadpage:any=false;
  isconnected:any;
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

  async ionViewWillEnter(){
    let status: any = await Network.getStatus();
    this.isconnected = status.connected;
    if (status.connected && status.connectionType != 'none') {
      this.init();
    }
    this.dt.detectChanges();
  }

  ngAfterViewInit() {
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

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillLeave(){
    this.onDestroy();
  }
  //#endregion

  //#region Function

  findOrder(){
    this.navCtrl.navigateForward('main/order/find');
  }

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
    this.isloadpage = true;
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
    this.api.execByParameter('Authencation', 'order', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.lstData = res[0];
        if (this.lstData.length == 0) this.isEmpty = true;
        if (this.lstData.length == res[1]) this.isload = false;
      }
      this.isloadpage = false;
      this.onDestroy();
      this.dt.detectChanges();
    })
  }

  viewDetail(data:any){
    this.navCtrl.navigateForward('main/order/detail',{queryParams:{data:JSON.stringify(data)}});
  }

  onback(){
    this.navCtrl.navigateBack('main');
  }

  onCopy(){
    this.notification.showNotiSuccess('','Đã Sao chép',1000);
  }

  onPayment(data:any){
    let queryParams = new HttpParams();
    queryParams = queryParams.append("id", data.id);
    queryParams = queryParams.append("username", this.username);
    this.api.execByParameter('Authencation', 'payment', queryParams,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res.isError) {
        let index = this.lstData.findIndex((x:any) => x.id == data.id);
        if(index > -1) this.lstData[index] = res.data;
        this.notification.showNotiSuccess('',res.message);
        this.dt.detectChanges();
      }else{
        this.notification.showNotiError('',res.message);
      }
      this.onDestroy();
    })
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
      this.api.execByParameter('Authencation', 'order', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          res[0].forEach((data: any) => {
            this.lstData.push(data);
          });
          if (this.lstData.length == res[1]) this.isload = false;
        }
        this.onDestroy();
        setTimeout(() => {
          (event as InfiniteScrollCustomEvent).target.complete();
          this.dt.detectChanges();
        }, 500);
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
    this.isloadpage = false;
    this.lstData = [];
    this.content.scrollToTop();
    this.loadData();
  }

  async init(){
    if(!this.username) this.username = await this.storage.get('username');
    let type = this.rt.snapshot.queryParams['type'];
    switch(type){
      case 'change':
        let array = JSON.parse(this.rt.snapshot.queryParams['lstdata']);
        array.forEach((item:any) => {
          let index = this.lstData.findIndex((x:any) => x.id == item.id);
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
