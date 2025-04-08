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
  recID:any;
  oData:any;
  oDataPackage:any;
  username:any;
  lstPackage:any;
  lstLog:any;
  lstVoucher:any;
  voucherSelected:any;
  isOpenPayment:any = false;
  previousUrl:any;
  isChange:any=false;
  content1:any='';
  content2:any='';
  content3:any='';
  isOpenVoucher:any = false;
  isOpenUseVoucher:any = false;
  isOpenWeightChange:any = false;
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
    let recID = this.rt.snapshot.queryParams['recID'];
    if(recID) this.recID = recID;
    this.getDetail();
    let content = await this.storage.get('infoContent');
    if (content) {
      let str = content.split(';');
      this.content1 = str[0];
      this.content2 = str[1];
      this.content3 = str[2];
    }
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
    this.cancelUseVoucher();
    this.cancelVoucher();
    let voucherID = '';
    if(this.voucherSelected) voucherID = this.voucherSelected?.voucherID;
    let data = {
      id: item.id,
      userName: this.username,
      voucherID:voucherID
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'payment', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res && !res.isError) {
        //this.notification.showNotiSuccess('',(res.message+'Vui lòng liên hệ CSKH để nhận hàng!'));
        this.oData = res?.data;
        this.isChange = true;
        InAppReview.requestReview();
        this.navCtrl.navigateForward('main/order/paymentdone');
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
      recID: this.recID,
      userName: this.username,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'getdetailorder', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      }else{
        let data = res[1]?.data;
        if (data != null) {
          this.oData= data?.order;
          this.lstPackage = data?.packs;
          this.lstLog = data?.logs;
          this.lstVoucher = data?.vouchers;
          if(this.lstPackage && this.lstPackage.length){
            this.oDataPackage = this.lstPackage[0];
          }
        }
      }
      this.onDestroy();
    })
  }

  onCopy(){
    this.notification.showNotiSuccess('','Đã Sao chép',1000);
  }

  viewDetailPackage(item:any){
    this.navCtrl.navigateForward('main/package/detail', { queryParams: { id: item.packageCode } });
  }

  goRechargePage(){
    this.navCtrl.navigateForward('main/recharge');
  }

  //#region Voucher
  onChooseVoucher(){
    this.cancelPayment();
    if(this.lstVoucher && this.lstVoucher?.length){
      this.openPopVoucher();
    }else{
      this.onPayment(this.oData);
    }
  }

  openPopVoucher(){
    this.isOpenVoucher = true;
  }

  cancelVoucher(){
    this.isOpenVoucher = false;
    this.dt.detectChanges();
  }

  onSelecteVoucher(event:any,item:any){
    if(event){
      this.voucherSelected = {...item};
    }else{
      this.voucherSelected = null;
    }
  }

  oncheckUseVoucher(){
    if(!this.voucherSelected){
      this.openPopUseVoucher();
    }else{
      this.onPayment(this.oData);
    }
  }
  //#endregion

  //#region UseVoucher
  openPopUseVoucher(){
    this.isOpenUseVoucher = true;
  }

  cancelUseVoucher(){
    this.isOpenUseVoucher = false;
    this.dt.detectChanges();
  }
  //#endregion

  //#region WeightChange
  openWeightChange(event:any){
    event.stopPropagation();
    this.isOpenWeightChange = true;
  }

  cancelWeightChange(){
    this.isOpenWeightChange = false;
    this.dt.detectChanges();
  }
  //#endregion WeightChange
}
