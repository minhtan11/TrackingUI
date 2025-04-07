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
  styleUrls: ['./package-page.component.scss']
})
export class PackagePageComponent implements OnInit, AfterViewInit {
  //#region Contrucstor
  @ViewChild(IonContent) content: IonContent;
  isReview: any;
  pageNum: any = 1;
  pageSize: any = 20;
  fromDate: any = '';
  toDate: any = '';
  username: any;
  status: any = 0;
  id: any = '';
  lstData: any;
  isEmpty: any = false;
  total: any = 0;
  isload: any = true;
  isconnected: any = true;
  isHideFooter: any = false;
  isOpenEditPackage: any = false;
  isOpenCheckPackage: any = false;
  isOpenCheckPackage2: any = false;
  isOpenCancelPackage: any = false;
  isOpenRestorePackage: any = false;
  isOpenDeletePackage: any = false;
  isOpenQueryPackage: any = false;
  isOpenNoQueryPackage: any = false;
  isOpenCheckFirst: any = false;
  isOpenDescript: any = false;
  isOpenFilter: any = false;
  isOpenOrder: any = false;
  itemSelected: any;
  firstLoad: any = true;
  total0: any;
  total1: any;
  total2: any;
  total3: any;
  total4: any;
  total5: any;
  total6: any;
  total7: any;
  total9: any;
  total10: any;
  total11: any;
  isSke:any=false;
  isSearchFocus:any=false;
  isFilter:any=false;
  private destroy$ = new Subject<void>();
  formGroup!: FormGroup;
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private router: Router,
    private platform: Platform,
    private formBuilder: FormBuilder,
    private previous: PreviousRouterServiceService
  ) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event && !(event.urlAfterRedirects.includes('/main/package/create')) && !(event.urlAfterRedirects.includes('/main/package/detail'))
          && !(event.urlAfterRedirects.includes('/main/package/orderstatus'))) {
          let type = this.rt.snapshot.queryParams['type'];
          switch (type) {
            case 'add':
              this.isload = true;
              this.pageNum = 1;
              this.isEmpty = false;
              this.content.scrollToTop();
              this.loadData();
              this.getTotal();
              break;
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
                if (this.status != data.status) {
                  let index = this.lstData.findIndex((x: any) => x.id == data.id);
                  if (index > -1) {
                    this.lstData.splice(index, 1);
                    if (this.lstData.length == 0) this.isEmpty = true;
                  }
                  this.getTotal();
                  return;
                }
              }
              
              break;
            case 'cancel':
              let dataCancel = JSON.parse(this.rt.snapshot.queryParams['dataCancel']);
              if (dataCancel) {
                if (this.status == 0) {
                  let index = this.lstData.findIndex((x: any) => x.id == dataCancel.id);
                  if (index > -1) {
                    this.lstData[index] = dataCancel;
                  }
                  this.getTotal();
                  return;
                }
                if (this.status == 1) {
                  let index = this.lstData.findIndex((x: any) => x.id == dataCancel.id);
                  if (index > -1) {
                    this.lstData.splice(index, 1);
                    if (this.lstData.length == 0) this.isEmpty = true;
                  }
                  this.getTotal();
                  return;
                }
              }
              break;
            case 'restore':
              let dataRestore = JSON.parse(this.rt.snapshot.queryParams['dataRestore']);
              if (dataRestore) {
                if (this.status == 0) {
                  let index = this.lstData.findIndex((x: any) => x.id == dataRestore.id);
                  if (index > -1) {
                    this.lstData[index] = dataRestore;
                  }
                  this.getTotal();
                  return;
                }
                if (this.status == 9) {
                  let index = this.lstData.findIndex((x: any) => x.id == dataRestore.id);
                  if (index > -1) {
                    this.lstData.splice(index, 1);
                    if (this.lstData.length == 0) this.isEmpty = true;
                  }
                  this.getTotal();
                  return;
                }
              }
              break;
            case 'delete':
              let datas = JSON.parse(this.rt.snapshot.queryParams['dataDelete']);
              if (datas) {
                let index = this.lstData.findIndex((x: any) => x.id == datas.id);
                if (index > -1) {
                  this.lstData.splice(index, 1);
                  if (this.lstData.length == 0) this.isEmpty = true;
                }
              }
              this.getTotal();
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

  ngAfterViewInit() {
    
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;

    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;

    });
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

  async ionViewWillEnter() {
    this.isReview = await this.storage.get('isReview');
    let status = this.rt.snapshot.queryParams["status"];
    if (status) {
      this.status = status;
    }
    this.init();
  }

  ionViewWillLeave() {
    this.onDestroy();
  }
  //#endregion 

  //#region Function

  // trackByFn(index:any, item:any) { 
  //   return index; 
  // }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sortData(status: any) {
    if (this.status == status) return;
    this.status = status;
    if (!this.isconnected) return;
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.isSke = true;
    this.content.scrollToTop();
    this.loadData();
  }

  async loadData() {
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
    this.api.execByBody('Authencation', 'package', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      } else {
        let oData = res[1];
        this.lstData = oData[0];
        if (this.lstData.length == 0) this.isEmpty = true;
        if (this.lstData.length == oData[1]) this.isload = false;
        if (this.firstLoad) this.firstLoad = false;
        this.isSke = false;
      }
    })
  }

  getTotal() {
    let data = {
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'gettotalpackage', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
      } else {
        let lst = res[1];
        this.total0 = lst.length;
        this.total1 = lst.filter((x:any) => x.status == 1).length;
        this.total2 = lst.filter((x:any) => x.status == 2).length;
        this.total3 = lst.filter((x:any) => x.status == 3).length;
        this.total4 = lst.filter((x:any) => x.status == 4).length;
        this.total5 = lst.filter((x:any) => x.status == 5).length;
        this.total6 = lst.filter((x:any) => x.status == 6).length;
        this.total7 = lst.filter((x:any) => x.status == 7).length;
        this.total9 = lst.filter((x:any) => x.status == 9).length;
        this.total10 = lst.filter((x:any) => x.status == 10).length;
        this.total11 = lst.filter((x:any) => x.status == 11).length;
      }
    })
  }

  createPackage() {
    this.navCtrl.navigateForward('main/package/create');
  }

  onCopy() {
    this.notification.showNotiSuccess('', 'Đã Sao chép', 1000);
  }

  viewDetail(data: any) {
    this.navCtrl.navigateForward('main/package/detail', { queryParams: { id: data.packageCode } });
  }

  onIonInfinite(event: any) {
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
        } else {
          let oData = res[1];
          oData[0].forEach((data: any) => {
            this.lstData.push(data);
          });
          if (this.lstData.length == oData[1]) this.isload = false;
          this.onDestroy();
          setTimeout(() => {
            (event as InfiniteScrollCustomEvent).target.complete();

          }, 500);
        }
      })
    }
  }

  ionChange(event: any) {
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

  async init() {
    this.username = await this.storage.get('username');
    this.isSke = true;
    this.lstData = [];
    this.loadData();
    this.getTotal();
    // let type = this.rt.snapshot.queryParams['type'];
    // switch(type){
    //   case 'add':
    //     this.isload = true;
    //     this.pageNum = 1;
    //     this.isEmpty = false;
    //     this.content.scrollToTop();
    //     this.loadData();
    //     break;


    //   default:
    //     this.isload = true;
    //     this.pageNum = 1;
    //     this.isEmpty = false;
    //     this.loadData();
    //     break;
    // }
  }

  //#region Edit package
  openPopPackage(item: any) {
    this.itemSelected = { ...item };
    this.isOpenEditPackage = true;
  }

  cancelEdit() {
    this.isOpenEditPackage = false;
    this.dt.detectChanges();
  }

  editPackage(item: any) {
    this.cancelEdit();
    let data = JSON.stringify(item);
    this.navCtrl.navigateForward('main/package/create', { queryParams: { data: data, isEdit: true } });
  }

  //#endregion Edit package

  //#region CheckPackage
  checkFirst(item: any){
    this.itemSelected = { ...item };
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
  openPopCheckPackage(item: any) {
    this.itemSelected = { ...item };
    this.isOpenCheckPackage = true;
  }

  cancelCheck() {
    this.isOpenCheckPackage = false;
    this.dt.detectChanges();
  }

  openPopCheckPackage2(item: any) {
    this.itemSelected = { ...item };
    this.isOpenCheckPackage2 = true;
  }

  cancelCheck2() {
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
    this.itemSelected = { ...item };
    this.isOpenQueryPackage = true;
  }

  cancelQueryPackage() {
    this.isOpenQueryPackage = false;
    this.dt.detectChanges();
  }

  openPopNoQueryPackage(item:any) {
    this.itemSelected = { ...item };
    this.isOpenNoQueryPackage = true;
  }

  cancelNoQueryPackage() {
    this.isOpenNoQueryPackage = false;
    this.dt.detectChanges();
  }

  onCheckPackage(item: any){
    this.cancelCheck2();
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
  openPopCancelPackage(item: any) {
    this.itemSelected = { ...item };
    this.isOpenCancelPackage = true;
  }

  cancelPopPackage() {
    this.isOpenCancelPackage = false;
    this.dt.detectChanges();
  }

  cancelPackage(item: any) {
    this.cancelPopPackage();
    let data = {
      id: item.id,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'cancel', messageBody, true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      } else {
        if (!res[1].isError) {
          this.notification.showNotiSuccess('', res[1].message);
          if (res[2]) {
            if (this.status == 0) {
              let index = this.lstData.findIndex((x: any) => x.id == res[2].id);
              if (index > -1) {
                this.lstData[index] = res[2];
              }
              this.getTotal();
              return;
            }
            if (this.status == 1) {
              let index = this.lstData.findIndex((x: any) => x.id == res[2].id);
              if (index > -1) {
                this.lstData.splice(index, 1);
                if (this.lstData.length == 0) this.isEmpty = true;
              }
              this.getTotal();
              return;
            }
          }
        } else {
          this.notification.showNotiError('', res[1].message);
        }
      }
      this.onDestroy();
    })
  }
  //#endregion

  //#region restorePackage
  openPopRestorePackage(item: any) {
    this.itemSelected = { ...item };
    this.isOpenRestorePackage = true;
  }

  cancelRestorePackage() {
    this.isOpenRestorePackage = false;
    this.dt.detectChanges();
  }

  restorePackage(item: any) {
    this.cancelRestorePackage();
    let data = {
      id: item.id,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'restorepackage', messageBody, true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      } else {
        if (!res[1].isError) {
          this.notification.showNotiSuccess('', res[1].message);
          if (res[2]) {
            if (this.status == 0) {
              let index = this.lstData.findIndex((x: any) => x.id == res[2].id);
              if (index > -1) {
                this.lstData[index] = res[2];
              }
              this.getTotal();
              return;
            }
            if (this.status == 9) {
              let index = this.lstData.findIndex((x: any) => x.id == res[2].id);
              if (index > -1) {
                this.lstData.splice(index, 1);
                if (this.lstData.length == 0) this.isEmpty = true;
              }
              this.getTotal();
              return;
            }
          }
        } else {
          this.notification.showNotiError('', res[1].message);
        }
      }
      this.onDestroy();
    })
  }
  //#endregion

  //#region DeletePackage
  openPopDeletePackage(item: any) {
    this.itemSelected = { ...item };
    this.isOpenDeletePackage = true;
  }

  cancelDeletePackage() {
    this.isOpenDeletePackage = false;
    this.dt.detectChanges();
  }

  deletePackage(item: any) {
    this.cancelDeletePackage();
    let data = {
      id: item.id,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'deletepackage', messageBody, true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      } else {
        if (!res[1].isError) {
          this.notification.showNotiSuccess('', res[1].message);
          let index = this.lstData.findIndex((x: any) => x.id == item.id);
          if (index > -1) {
            this.lstData.splice(index, 1);
            if (this.lstData.length == 0) this.isEmpty = true;
          }
          this.getTotal();
        } else {
          this.notification.showNotiError('', res[1].message);
        }
      }
      this.onDestroy();
    })
  }
  //#endregion
  //#endregion

  //#region FilterPackage
  openPopFilter() {
    this.isOpenFilter = true;
  }

  cancelFilter() {
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
    this.itemSelected = { ...item };
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

  changeAutoQuery(item: any,check:any){
    this.itemSelected = { ...item };
    let data = {
      id: this.itemSelected.id,
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
          let index = this.lstData.findIndex((x:any) => x.id == this.itemSelected?.id);
          if(index > -1) this.lstData[index].autoQuery = check;
          this.dt.detectChanges();
        }
      }
    })
  }
  //#endregion
}
