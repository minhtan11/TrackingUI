import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Network } from '@capacitor/network';
import { InfiniteScrollCustomEvent, IonContent, IonRouterOutlet, NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss']
})
export class NotificationPageComponent {
  @ViewChild(IonContent) content: IonContent;
  pageSize: any = 20;
  lstData: any;
  pageNum: any = 1;
  fromDate: any = null;
  toDate: any = null;
  status: any = -1;
  id: any;
  isEmpty: any = false;
  isload: any = true;
  formGroup!: FormGroup;
  isOpenFilter:any = false;
  private destroy$ = new Subject<void>();
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private routerOutlet: IonRouterOutlet,
    private formBuilder: FormBuilder,
    private previous:PreviousRouterServiceService,
  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      fromDate: [null],
      toDate: [null],
    });
  }

  ngAfterViewInit() {
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
    this.init();
  }

  ionViewDidEnter() {
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillLeave() {
    this.onDestroy();
  }

  init(){
    this.lstData = [];
    this.loadData();
  }

  async loadData(isShowLoad:any=true){
    let username = await this.storage.get('username');
    let data = {
      status: this.status,
      fromDate: this.formGroup.value.fromDate,
      toDate: this.formGroup.value.toDate,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      userName: username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    if (isShowLoad) {
      this.api.execByBody('Authencation', 'notification', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
        } else {
          let oData = res[1];
          this.lstData = oData[0];
          if (this.lstData.length == 0) this.isEmpty = true;
          if (this.lstData.length == oData[1]) this.isload = false;
        }
      })
    }else{
      this.api.execByBody('Authencation', 'notification', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
        } else {
          let oData = res[1];
          this.lstData = oData[0];
          if (this.lstData.length == 0) this.isEmpty = true;
          if (this.lstData.length == oData[1]) this.isload = false;
        }
      })
    }
    
  }

  async onIonInfinite(event: any) {
    if (this.isload) {
      let username = await this.storage.get('username');
      this.pageNum += 1;
      let data = {
        status: this.status,
        fromDate: this.formGroup.value.fromDate,
        toDate: this.formGroup.value.toDate,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        userName: username
      }
      let messageBody = {
        dataRequest: JSON.stringify(data)
      };
      this.api.execByBody('Authencation', 'notification', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
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
    this.content.scrollToTop();
    this.loadData();
    this.cancelFilter();
  }

  clearFilter(){
    this.formGroup.reset();
  }

  async goPackageDetail(orderCode:any){
    this.navCtrl.navigateForward('main/package/detail', { queryParams: { id: orderCode } });
  }
  //#endregion
}
