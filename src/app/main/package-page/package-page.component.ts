import { HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonContent, IonSegment, IonSegmentButton, NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import Swal from 'sweetalert2';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';

@Component({
  selector: 'app-package-page',
  templateUrl: './package-page.component.html',
  styleUrls: ['./package-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagePageComponent  implements OnInit,AfterViewInit {
  //#region Contrucstor
  @ViewChild(IonContent) content: IonContent;
  isReview:any;
  pageNum:any = 1;
  pageSize:any = 20;
  fromDate:any = '';
  toDate:any = '';
  username:any;
  status:any = 0;
  id:any='';
  lstData:any = [];
  isEmpty:any = false;
  total:any = 0;
  isload:any=true;
  isconnected:any = true;
  isHideFooter:any=false;
  isOpenEditPackage:any = false;
  isOpenCheckPackage:any = false;
  isOpenCheckPackage2:any = false;
  isOpenCancelPackage:any = false;
  isOpenRestorePackage:any = false;
  isOpenDeletePackage:any = false;
  isOpenFilter:any = false;
  itemSelected:any;
  firstLoad:any = true;
  private destroy$ = new Subject<void>();
  formGroup!: FormGroup;
  constructor(
    private dt : ChangeDetectorRef,
    private api : ApiserviceComponent,
    private rt : ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private router: Router,
    private platform: Platform,
    private formBuilder: FormBuilder,
    private previous:PreviousRouterServiceService
  ) { 
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {        
        if (event && !(event.urlAfterRedirects.includes('/main/package/create')) && !(event.urlAfterRedirects.includes('/main/package/detail'))
          && !(event.urlAfterRedirects.includes('/main/package/orderstatus'))) {
          let type = this.rt.snapshot.queryParams['type'];
          switch(type){
            case 'add':
              this.isload = true;
              this.pageNum = 1;
              this.isEmpty = false;
              this.content.scrollToTop();
              this.loadData();
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

  ngAfterViewInit(){
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
      this.dt.detectChanges();
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
      this.dt.detectChanges();
    });
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

  async ionViewWillEnter(){
    this.isReview = await this.storage.get('isReview');
    let status = this.rt.snapshot.queryParams["status"];
    if (status) {
      this.status = status;
      this.dt.detectChanges();
    }
    this.init();
    this.dt.detectChanges();
  }

  ionViewWillLeave(){
    this.onDestroy();
  }
  //#endregion 

  //#region Function

  // trackByFn(index:any, item:any) { 
  //   return index; 
  // }

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
    this.dt.detectChanges();
    this.loadData();
  }

  loadData(){
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
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'package', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res: any) =>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            let oData = res[1];
            this.lstData = oData[0];
            if (this.lstData.length == 0) this.isEmpty = true;
            if (this.lstData.length == oData[1]) this.isload = false;
            if(this.firstLoad) this.firstLoad = false;
            this.dt.detectChanges();
          }
        },
        complete:()=>{
          this.api.isLoad(false);
        }
      })
    }, 1000);
  }

  createPackage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/package/create');
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
    this.navCtrl.navigateBack('main',{queryParams:{selected:0}});
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
    this.loadData();
    // let type = this.rt.snapshot.queryParams['type'];
    // switch(type){
    //   case 'add':
    //     this.isload = true;
    //     this.pageNum = 1;
    //     this.isEmpty = false;
    //     this.content.scrollToTop();
    //     this.loadData();
    //     break;
    //   // case 'change':
    //   //   let data = JSON.parse(this.rt.snapshot.queryParams['dataUpdate']);
    //   //   if(data){
    //   //     let index = this.lstData.findIndex((x:any) => x.id == data.id);
    //   //     if(index > -1){
    //   //       this.lstData[index] = data;
    //   //       this.dt.detectChanges();
    //   //     } 
    //   //   }
    //   //   break;
    //   // case 'delete':
    //   //   let datas = JSON.parse(this.rt.snapshot.queryParams['dataDelete']);
    //   //   if(datas){
    //   //     let index = this.lstData.findIndex((x:any) => x.id == datas.id);
    //   //     if(index > -1){
    //   //       this.lstData.splice(index,1);
    //   //       if(this.lstData.length == 0) this.isEmpty = true;
    //   //       this.dt.detectChanges();
    //   //     } 
    //   //   }
    //   //   break;
    //   default:
    //     // if (this.lstData && this.lstData.length == 0 && this.firstLoad) {
    //     //   this.isload = true;
    //     //   this.pageNum = 1;
    //     //   this.isEmpty = false;
    //     //   this.loadData();
    //     // }
    //     this.isload = true;
    //     this.pageNum = 1;
    //     this.isEmpty = false;
    //     this.loadData();
    //     break;
    // }
  }

  //#region Edit package
  openPopPackage(item:any){
    this.itemSelected = {...item};
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
  openPopCheckPackage(item:any){
    this.itemSelected = {...item};
    this.isOpenCheckPackage = true;
  }

  cancelCheck(){
    this.isOpenCheckPackage = false;
    this.dt.detectChanges();
  }

  openPopCheckPackage2(item:any){
    this.itemSelected = {...item};
    this.isOpenCheckPackage2 = true;
    this.dt.detectChanges();
  }

  cancelCheck2(){
    this.isOpenCheckPackage2 = false;
    this.dt.detectChanges();
  }

  continuteCheck(item:any){
    this.cancelCheck();
    this.dt.detectChanges();
    let data = {
      id: item.packageCode,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'checkavailable', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
          this.api.isLoad(false);
        } else {
          if (res[1] == 0) {
            this.api.isLoad(false);
            this.openPopCheckPackage2(item);
          }else{
            this.checkPackage(item);
          }
        }
      })
    }, 500);
  }

  checkPackage(item:any){
    this.cancelCheck2();
    this.api.isLoad(true);
    setTimeout(() => {
      let data = {
        id: item.packageCode,
        userName: this.username
      }
      let messageBody = {
        dataRequest: JSON.stringify(data)
      };
      this.api.execByBody('Authencation', 'checkstatus', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          } else {
            this.navCtrl.navigateForward('main/package/orderstatus',{ queryParams: {data: JSON.stringify(res[1])}});
          }
        },
        complete:()=>{
          this.api.isLoad(false);
          this.onDestroy();
        }
      })
    }, 500);
  }
  //#endregion CheckPackage

  //#region CancelPackage
  openPopCancelPackage(item:any){
    this.itemSelected = {...item};
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
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'cancel', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            if (!res[1].isError) {
              this.notification.showNotiSuccess('', res[1].message);
              if(res[2]){
                let index = this.lstData.findIndex((x: any) => x.id == res[2].id);
                if (index > -1) {
                  this.lstData[index] = res[2];
                  this.dt.detectChanges();
                } 
              }
            } else {
              this.notification.showNotiError('', res[1].message);
            }
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

  //#region restorePackage
  openPopRestorePackage(item:any){
    this.itemSelected = {...item};
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
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'restorepackage', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            if (!res[1].isError) {
              this.notification.showNotiSuccess('', res[1].message);
              if(res[2]){
                let index = this.lstData.findIndex((x: any) => x.id == res[2].id);
                if (index > -1) {
                  this.lstData[index] = res[2];
                  this.dt.detectChanges();
                } 
              }
            } else {
              this.notification.showNotiError('', res[1].message);
            }
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

  //#region DeletePackage
  openPopDeletePackage(item:any){
    this.itemSelected = {...item};
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
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'deletepackage', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            if (!res[1].isError) {
              this.notification.showNotiSuccess('', res[1].message);
              let index = this.lstData.findIndex((x: any) => x.id == item.id);
              if (index > -1) {
                this.lstData.splice(index,1);
                if(this.lstData.length == 0) this.isEmpty = true;
                this.dt.detectChanges();
              } 
            } else {
              this.notification.showNotiError('', res[1].message);
            }
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
  //#endregion

  //#region FilterPackage
  openPopFilter(){
    this.isOpenFilter = true;
  }

  cancelFilter(){
    this.isOpenFilter = false;
    this.dt.detectChanges();
  }

  onFilter(){
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.dt.detectChanges();
    this.loadData();
    this.cancelFilter();
  }

  clearFilter(){
    this.formGroup.reset();
    this.dt.detectChanges();
  }
  //#endregion
}
