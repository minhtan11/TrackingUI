import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, OnInit } from '@angular/core';
import {ActivatedRoute, Router } from '@angular/router';
import { InAppReview } from '@capacitor-community/in-app-review';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-order-page-detail',
  templateUrl: './order-page-detail.component.html',
  styleUrls: ['./order-page-detail.component.scss'],
})
export class OrderPageDetailComponent {
  id:any;
  oData:any;
  username:any;
  lstPackage:any;
  isOpenPayment:any = false;
  previousUrl:any;
  isChange:any=false;
  private destroy$ = new Subject<void>();
  constructor(
    private navCtrl: NavController,
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
    private storage: StorageService,
    private api : ApiserviceComponent,
    private notification: NotificationServiceComponent,
    private previous:PreviousRouterServiceService,
    private platform : Platform,
    private router:Router,
  ) { 
  }

  async ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('main/order/detail'))){
        this.onback();
        return;
      }
      processNextHandler();
    })
  }
  

  async ionViewWillEnter(){
    this.username = await this.storage.get('username');
    let id = this.rt.snapshot.queryParams['id'];
    if(id) this.id = id;
    this.getDetail();
    if (!this.previousUrl) {
      let url = this.previous.getPreviousUrl();
      if (url) {
        let array = url.split('?');
        this.previousUrl = array[0];
      }
    } 
  }

  ionViewWillLeave(){
    this.onDestroy();
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  openPayment(item:any){
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
    this.api.execByBody('Authencation', 'payment', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res && !res.isError) {
        this.notification.showNotiSuccess('',(res.message+'.Vui lòng liên hệ CSKH để nhận hàng!'));
        this.oData = res?.data;
        this.isChange = true;
        InAppReview.requestReview();
      }else{
        this.notification.showNotiError('',res.message);
      }
      this.onDestroy();
    })
  }

  onback(){
    if(this.previousUrl.includes('/main/order')){
      if(this.isChange){
        this.navCtrl.navigateBack(this.previousUrl,{queryParams:{type:'change',dataUpdate:JSON.stringify(this.oData)}});
      }else{
        this.navCtrl.navigateBack(this.previousUrl);
      }
    }else{
      this.navCtrl.navigateBack(this.previousUrl);
    }
  }

  getDetail(){
    let data = {
      recID: this.id,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'getdetail', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      }else{
        this.oData = res[1];
        this.lstPackage = res[2];
      }
      this.onDestroy();
    })
  }

  onCopy(){
    this.notification.showNotiSuccess('','Đã Sao chép',1000);
  }
}
