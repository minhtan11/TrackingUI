import { HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { InAppReview } from '@capacitor-community/in-app-review';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';
import { InfiniteScrollCustomEvent, IonContent, NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
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
  lstData:any;
  isEmpty:any = false;
  isload:any=true;
  isconnected:any = true;
  itemSelected:any;
  isOpenPayment:any = false;
  totalPay:any = 0;
  totalOrder:any = 0;
  isOpenFilter:any = false;
  private destroy$ = new Subject<void>();
  formGroup!: FormGroup;
  previousUrl:any;
  total0:any;
  total1:any;
  total2:any;
  total3:any;
  total4:any;
  isSke:any=false;
  isHideFooter:any=false;
  isSearchFocus:any=false;
  arrOrderSelected:any=[];
  isCheckAll:any=false;
  totalAllOrder:any=0;
  isPayment:any=false;
  isFilter:any=false;
  constructor(
    private dt : ChangeDetectorRef,
    private api : ApiserviceComponent,
    private rt : ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private platform: Platform,
    private router: Router,
    private formBuilder: FormBuilder,
    private previous:PreviousRouterServiceService
  ) { 
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {        
        if (event && !(event.urlAfterRedirects.includes('/main/order/detail'))) {
          let type = this.rt.snapshot.queryParams['type'];
          switch(type){
            case 'change':
              let data = JSON.parse(this.rt.snapshot.queryParams['dataUpdate']);
              if (data) {
                if (this.status == 0) {
                  let index = this.lstData.findIndex((x: any) => x.id == data.id);
                  if (index > -1) {
                    this.lstData[index] = data;
                  }
                  this.getTotal();
                  return;
                }
                if(this.status == 1){
                  let index = this.lstData.findIndex((x: any) => x.id == data.id);
                  if (index > -1) {
                    this.lstData.splice(index, 1);
                  }
                  if (this.lstData.length == 0){
                    this.isEmpty = true;
                    let array = this.lstData.filter((x: any) => x.status == 1);
                    if (array.length > 0) {
                      this.isPayment = true;
                    } else {
                      this.isPayment = false;
                    } 
                  }else{
                    this.totalPay = this?.lstData.reduce((sum:any, data:any) => sum + parseFloat(data?.totalPrice),0);
                    let array = this.lstData.filter((x: any) => x.status == 1);
                    if (array.length > 0) {
                      this.isPayment = true;
                    } else {
                      this.isPayment = false;
                    } 
                  } 
                  this.getTotal();
                  return;
                }
              }
              break;
          }
        }
      };
    });
  }
  //#endregion

  //#region Init

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      fromDate: [null],
      toDate: [null],
    });
  }

  async ionViewWillEnter(){
    let status = this.rt.snapshot.queryParams["status"];
    if (status) {
      this.status = status;
    }
    this.init();
    // if (!this.previousUrl) {
    //   let url = this.previous.getPreviousUrl();
    //   if (url) {
    //     let array = url.split('?');
    //     this.previousUrl = array[0];
    //   }
    // } 
  }

  ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
      
    });
    // this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
    //   if((this.router.url.includes('main/order'))){
    //     this.onback();
    //     return;
    //   }
    //   processNextHandler();
    // })
    // Network.addListener('networkStatusChange', status => {
    //   this.isconnected = status.connected;
    //   if (status.connected && status.connectionType != 'none') {
    //     this.isloadpage = true;
    //     
    //     setTimeout(() => {
    //       this.loadData();
    //     }, 500);  
    //   }
    //   if (!status.connected && status.connectionType == 'none') {
    //     this.lstData = [];
    //     this.isload = true;
    //     this.pageNum = 1;
    //     this.isEmpty = false;
    //     
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

  sortData(status:any){
    if(this.status == status) return;
    this.status = status;
    if(!this.isconnected) return;
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.isSke = true;
    this.totalAllOrder = 0;
    this.arrOrderSelected = [];
    this.isCheckAll = false;
    this.content.scrollToTop();
    this.loadData();
  }


  async loadData(){
    let username = await this.storage.get('username');
    let data = {
      status: this.status,
      id: this.id,
      fromDate: this.formGroup.value.fromDate,
      toDate: this.formGroup.value.toDate,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      userName: username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'order', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      }else{
        let oData = res[1];
        this.lstData = oData[0];
        if (this.lstData.length == 0) this.isEmpty = true;
        if (this.lstData.length == oData[1]) this.isload = false;
        this.totalPay = this?.lstData.reduce((sum:any, data:any) => sum + parseFloat(data?.totalPrice),0);
        this.isSke = false;
        let array = this.lstData.filter((x:any) => x.status == 1);
        if(array.length > 0){
          this.isPayment = true;
        }else{
          this.isPayment = false;
        } 
      }
    })
  }

  getTotal(){
    let data = {
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'gettotalorder', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res[0]) {
      } else {
        let lst = res[1];
        this.total0 = lst.length;
        this.total1 = lst.filter((x:any) => x.status == 1).length;
        this.total2 = lst.filter((x:any) => x.status == 2).length;
        this.total3 = lst.filter((x:any) => x.status == 3).length;
        this.total4 = lst.filter((x:any) => x.status == 9).length;
      }
    })
  }

  viewDetail(data:any){
    this.navCtrl.navigateForward('main/order/detail',{queryParams:{id:data.recID}});
  }

  onback(){
    this.navCtrl.navigateBack(this.previousUrl);
    // this.navCtrl.navigateBack('main',{queryParams:{selected:0}});
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
        fromDate: this.formGroup.value.fromDate,
        toDate: this.formGroup.value.toDate,
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
          }, 500);
        }
      })
    }
  }

  ionChange(event:any){
    this.id = event?.detail?.value;
    if (this.id == null || this.id == '') this.id = '';
    this.pageNum = 1;
    this.isload = true;
    this.isEmpty = false;
    this.lstData = [];
    this.isSke = true;
    this.content.scrollToTop();
    this.loadData();
    Keyboard.hide();
  }

  ionFocus(event:any){
    this.isSearchFocus = true;
  }

  ionBlur(event:any){
    this.isSearchFocus = false;
  }

  async init(){
    this.username = await this.storage.get('username');
    this.isSke = true;
    this.lstData = [];
    this.loadData();
    this.getTotal();
    // let type = this.rt.snapshot.queryParams['type'];
    // switch(type){
    //   case 'change':
    //     let data = JSON.parse(this.rt.snapshot.queryParams['dataUpdate']);
    //     if(data){
    //       let index = this.lstData.findIndex((x:any) => x.id == data.id);
    //       if(index > -1){
    //         this.lstData[index] = data;
            
    //       } 
    //     }
    //     break;
    //   default:
    //     if (this.lstData && this.lstData.length == 0) {
    //       this.isload = true;
    //       this.pageNum = 1;
    //       this.isEmpty = false;
    //       this.loadData();
    //     }
    //     break;
    // }
  }

  openPayment(){
    //this.itemSelected = {...item};
    this.isOpenPayment = true;
  }

  cancelPayment(){
    this.isOpenPayment = false;
    this.dt.detectChanges();
  }

  onPayment(){
    this.cancelPayment();
    let sArray = this.arrOrderSelected.map((x:any) => x.recID).join(',');
    let data = {
      id: sArray,
      userName: this.username,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'paymentselected', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res && !res.isError) {
        this.notification.showNotiSuccess('',(res.message+'.Vui lòng liên hệ CSKH để nhận hàng!'));
        this.isCheckAll = false;
        this.arrOrderSelected = [];
        this.totalAllOrder = 0;
        this.api.callBackOrder(true);
        if(res?.data && res?.data?.length){
          if(this.status == 0){
            res.data.forEach((item:any) => {
              let index = this.lstData.findIndex((x: any) => x.id == item.id);
              if (index > -1) {
                this.lstData[index] = item;
              } 
            });
            let array = this.lstData.filter((x: any) => x.status == 1);
            if (array.length > 0) {
              this.isPayment = true;
            } else {
              this.isPayment = false;
            } 
          }
          if(this.status == 1){
            this.loadData();
          }
          this.getTotal();
        }
        InAppReview.requestReview();
      }else{
        this.notification.showNotiError('',res.message);
      }
    })
  }
  //#endregion

  //#region FilterPackage
  openPopFilter(){
    this.isOpenFilter = true;
  }

  cancelFilter(){
    this.isOpenFilter = false;
    this.dt.detectChanges();
  }

  onFilter() {
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.isFilter = true;
    this.content.scrollToTop();
    this.loadData();
    this.cancelFilter();
  }

  clearFilter() {
    this.formGroup.reset();
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.isFilter = false;
    this.content.scrollToTop();
    this.loadData();
    this.cancelFilter();
  }

  onSelected(event:any,item:any){
    if (event) {
      this.arrOrderSelected.push(item);
    }else{
      let index = this.arrOrderSelected.findIndex((x: any) => x.id == item.id);
      if (index > -1) {
        this.arrOrderSelected.splice(index, 1);
        if(this.arrOrderSelected.length == 0){
          this.isCheckAll = false;
        }
      } 
    }
    this.totalAllOrder = this?.arrOrderSelected.reduce((sum:any, data:any) => sum + parseFloat(data?.totalPrice),0);
  }

  onSelectedAll(event:any){
    if (event) {
      if (this.status == 0) {
        let lst = this.lstData.filter((x:any) => x.status == 1);
        this.arrOrderSelected = lst;
        this.isCheckAll = event;
      }
      if(this.status == 1){
        this.arrOrderSelected = this.lstData;
      }
      this.totalAllOrder = this?.arrOrderSelected.reduce((sum:any, data:any) => sum + parseFloat(data?.totalPrice),0);
    }else{
      this.arrOrderSelected = [];
      this.isCheckAll = false;
      this.totalAllOrder = 0;
    }
  }
  //#endregion
}
