import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';
import Swal from 'sweetalert2'
import Swiper from 'swiper';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent  implements OnInit {
  @ViewChild('swiperRef') swiperRef: ElementRef | undefined;
  swiper:Swiper;
  oData:any;
  oDataStatus:any;
  id:any;
  username:any;
  isOpenEditPackage:any = false;
  isOpenCheckPackage:any = false;
  isOpenCheckPackage2:any = false;
  isOpenCancelPackage:any = false;
  isOpenRestorePackage:any = false;
  isOpenDeletePackage:any = false;
  isOpenQueryPackage: any = false;
  isOpenNoQueryPackage: any = false;
  isOpenDescript: any = false;
  isOpenCheckFirst: any = false;
  isOpenOrder:any=false;
  previousUrl:any;
  isChange:any=false;
  isCancel:any=false;
  isRestore:any=false;
  content1:any='';
  content2:any='';
  content3:any='';
  private destroy$ = new Subject<void>();
  constructor(
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
    private api : ApiserviceComponent,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private previous:PreviousRouterServiceService,
    private platform : Platform,
    private router:Router,
  ) { 
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {        
        if (event && (event.urlAfterRedirects.includes('/main/package/detail'))) {
          let type = this.rt.snapshot.queryParams['type'];
          switch(type){
            case 'change':
              this.isChange = true;
              let data = JSON.parse(this.rt.snapshot.queryParams['dataUpdate']);
              if (data) {
                this.oData = {...data};
              }
              break;
          }
        }
      };
    });
  }

  async ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('main/package/detail'))){
        this.onback();
        return;
      }
      processNextHandler();
    })
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    let id = this.rt.snapshot.queryParams['id'];
    if(id) this.id = id;
    this.username = await this.storage.get('username');
    this.getPackage();
    this.getStatus();
    if (!this.previousUrl) {
      let url = this.previous.getPreviousUrl();
      if (url) {
        let array = url.split('?');
        if(array[0].includes('/main/order/detail')){
          this.previousUrl = url;
        }else{
          this.previousUrl = array[0];
        }
      }
    } 
    let content = await this.storage.get('infoContent');
    if (content) {
      let str = content.split(';');
      this.content1 = str[0];
      this.content2 = str[1];
      this.content3 = str[2];
    }
  }

  ionViewWillLeave(){
    this.previousUrl = '';
    this.onDestroy();
  }

  onback(){
    if(this.previousUrl.includes('/main/package')){
      if (this.isCancel) {
        this.navCtrl.navigateBack(this.previousUrl,{queryParams:{type:'cancel',dataCancel:JSON.stringify(this.oData)}});
        return;
      }
      if (this.isRestore) {
        this.navCtrl.navigateBack(this.previousUrl,{queryParams:{type:'restore',dataRestore:JSON.stringify(this.oData)}});
        return;
      }
      if(this.isChange){
        this.navCtrl.navigateBack(this.previousUrl,{queryParams:{type:'change',dataUpdate:JSON.stringify(this.oData)}});
        return;
      }
      this.navCtrl.navigateBack(this.previousUrl);
    }else{
      this.navCtrl.navigateBack(this.previousUrl);
    }
    this.onDestroy();
  }

  onCopy(){
    this.notification.showNotiSuccess('','Đã Sao chép',1000);
  }

  getPackage(){
    let data = {
      id: this.id,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'getonepackage', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res[0]) {
      } else {
        if(res[1]){
          this.oData = res[1];
          if(this.oData && this.oData?.status > 1) this.setSlide();
        } 
      }
    })
  }

  getStatus(){
    let data = {
      id: this.id,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'checkstatus', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      } else {
        this.oDataStatus = res[1];
      }
    })
  }

  //#region Edit package
  openPopPackage(item:any){
    this.isOpenEditPackage = true;
  }

  cancelEdit(){
    this.isOpenEditPackage = false;
    this.dt.detectChanges();
  }

  editPackage(item:any){
    this.cancelEdit();
    let data = JSON.stringify(item);
    this.navCtrl.navigateForward('main/package/create',{queryParams:{data:data,isEdit:true}});
  }
  //#endregion Edit package

  //#region CheckPackage
  checkFirst(item: any){
    if (item && item?.status > 3) {
      this.isOpenCheckFirst = true;
    }else{
      this.checkQuery(item);
    }
  }

  cancelcheckFirst() {
    this.isOpenCheckFirst = false;
    this.dt.detectChanges();
  }

  checkQuery(item: any){
    this.cancelcheckFirst();
    if (item?.searchBaiduTimes == 0) {
      this.openPopCheckPackage(item);
    }else{
      if (item?.autoQuery) {
        this.openPopQueryPackage(item);
      }else{
        this.openPopNoQueryPackage(item);
      }
    }
  }

  openPopCheckPackage(item:any){
    this.isOpenCheckPackage = true;
  }

  cancelCheck(){
    this.isOpenCheckPackage = false;
    this.dt.detectChanges();
  }

  openPopCheckPackage2(item:any){
    this.isOpenCheckPackage2 = true;
  }

  cancelCheck2(){
    this.isOpenCheckPackage2 = false;
    this.dt.detectChanges();
  }

  continuteCheck(item: any) {
    this.cancelCheck();
    let data = {
      id: item.packageCode,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'checkavailable', messageBody, true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      } else {
        if (res[1] == 0) {
          this.openPopCheckPackage2(item);
        } else {
          this.onCheckPackage(item);
        }
      }
    })
  }

  openPopQueryPackage(item:any) {
    this.isOpenQueryPackage = true;
  }

  cancelQueryPackage() {
    this.isOpenQueryPackage = false;
    this.dt.detectChanges();
  }

  openPopNoQueryPackage(item:any) {
    this.isOpenNoQueryPackage = true;
  }

  cancelNoQueryPackage() {
    this.isOpenNoQueryPackage = false;
    this.dt.detectChanges();
  }

  onCheckPackage(item: any){
    this.cancelQueryPackage();
    this.cancelNoQueryPackage();
    let data = {
      id: item.packageCode,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'checkstatus', messageBody, true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      } else {
        this.navCtrl.navigateForward('main/package/orderstatus', { queryParams: { data: JSON.stringify(res[1]) } });
      }
      this.onDestroy();
    })
  }
  //#endregion CheckPackage

  //#region CancelPackage
  openPopCancelPackage(item:any){
    this.isOpenCancelPackage = true;
  }

  cancelPopPackage(){
    this.isOpenCancelPackage = false;
    this.dt.detectChanges();
  }

  cancelPackage(item:any){
    this.cancelPopPackage();
    let data = {
      id: item.id,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'cancel', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      }else{
        if (!res[1].isError) {
          this.notification.showNotiSuccess('', res[1].message);
          this.oData = res[2];
          this.isCancel = true;
          this.isChange = false;
          this.isRestore = false;
        } else {
          this.notification.showNotiError('', res[1].message);
        }
      }
      this.onDestroy();
    })
  }
  //#endregion

  //#region restorePackage
  openPopRestorePackage(item:any){
    this.isOpenRestorePackage = true;
  }

  cancelRestorePackage(){
    this.isOpenRestorePackage = false;
    this.dt.detectChanges();
  }

  restorePackage(item:any){
    this.cancelRestorePackage();
    let data = {
      id: item.id,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'restorepackage', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      }else{
        if (!res[1].isError) {
          this.notification.showNotiSuccess('', res[1].message);
          this.oData = res[2];
          this.isRestore = true;
          this.isChange = false;
          this.isCancel = false;
        } else {
          this.notification.showNotiError('', res[1].message);
        }
      }
      this.onDestroy();
    })
  }
  //#endregion

  //#region DeletePackage
  openPopDeletePackage(item:any){
    this.isOpenDeletePackage = true;
  }

  cancelDeletePackage(){
    this.isOpenDeletePackage = false;
    this.dt.detectChanges();
  }

  deletePackage(item:any){
    this.cancelDeletePackage();
    let data = {
      id: item.id,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'deletepackage', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      }else{
        if (!res[1].isError) {
          this.notification.showNotiSuccess('', res[1].message);
          if(this.previousUrl.includes('/main/package')){
            this.navCtrl.navigateBack(this.previousUrl,{queryParams:{type:'delete',dataDelete:JSON.stringify(this.oData)}});
          }else{
            this.navCtrl.navigateBack(this.previousUrl);
          }
        } else {
          this.notification.showNotiError('', res[1].message);
        }
      }
    })
  }
  //#endregion

  //#region Descipt
  openPopDescrip() {
    this.isOpenDescript = true;
  }

  cancelPopDescrip() {
    this.isOpenDescript = false;
    this.dt.detectChanges();
  }
  //#endregion

  //#region ViewOrder
  openPopViewOrder(item: any) {
    this.isOpenOrder = true;
  }

  cancelPopViewOrder() {
    this.isOpenOrder = false;
    this.dt.detectChanges();
  }

  viewOrder(item:any){
    this.cancelPopViewOrder();
    this.navCtrl.navigateForward('main/order/detail',{queryParams:{recID:item.transID}});
  }

  setSlide(){
    let interval = setInterval(() => {
      this.swiper = this.swiperRef?.nativeElement?.swiper;
      if(this.swiper){
        clearInterval(interval);
        this.swiper.slideTo(1);
      } 
    });
  }

  changeAutoQuery(check:any){
    let data = {
      id: this.oData.id,
      check: check
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'changeautoquery', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      } else {
        if (res[1].isError) {
          this.notification.showNotiError('', res[1].message);
        }else{
          this.notification.showNotiSuccess('', res[1].message);
          this.oData.autoQuery = check;
        }
      }
    })
  }
  //#endregion
}
