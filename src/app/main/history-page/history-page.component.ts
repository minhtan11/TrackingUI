import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { PushNotificationSchema, PushNotifications } from '@capacitor/push-notifications';
import { InfiniteScrollCustomEvent, IonContent, IonRouterOutlet, NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.scss'],
})
export class HistoryPageComponent {
  //#region Contrucstor
  @ViewChild(IonContent) content: IonContent;
  pageSize: any = 20;
  lstData: any;
  pageNum: any = 1;
  fromDate: any = null;
  toDate: any = null;
  status: any = 0;
  id: any;
  isEmpty: any = false;
  isload: any = true;
  formGroup!: FormGroup;
  isOpenFilter:any = false;
  previousUrl:any;
  isSke:any=false;
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
    private platform : Platform,
    private router:Router,
  ) { }
  //#endregion

  //#region Init
  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      fromDate: [null],
      toDate: [null],
    });
  }

  async ngAfterViewInit(){
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('main/history'))){
        this.onback();
        return;
      }
      processNextHandler();
    })
    await PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        let array = this.router.url.split('?');
        let url = array[0];
        if ((url.includes('main/history'))) {
          this.refresh();
        }
      }
    );
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

  async ionViewWillEnter(){
    this.init();
    if (!this.previousUrl) {
      let url = this.previous.getPreviousUrl();
      if (url) {
        let array = url.split('?');
        this.previousUrl = array[0];
      }
    } 
  }

  ionViewDidEnter() {
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillLeave(){
    this.onDestroy();
  }
  //#endregion

  //#region Function
  init(){
    this.isSke = true;
    this.lstData = [];
    this.loadData();
  }

  refresh(){
    this.isload = true;
    this.pageNum = 1;
    this.isEmpty = false;
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
    this.api.execByBody('Authencation', 'historywallet', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      } else {
        let oData = res[1];
        this.lstData = oData[0];
        if (this.lstData.length == 0) this.isEmpty = true;
        let total = 0;
        this.lstData.forEach((item: any) => {
          total += item.datas.length;
        });
        if (total == oData[1]) this.isload = false;
        this.isSke = false;
      }
      this.dt.detectChanges();
    })
  }

  sortData(status: any) {
    if(this.status == status) return;
    this.status = status;
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.isSke = true;
    this.content.scrollToTop();
    this.loadData();
  }

  async onIonInfiniteHis(event: any) {
    if (this.isload) {
      let username = await this.storage.get('username');
      this.pageNum += 1;
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
      this.api.execByBody('Authencation', 'historywallet', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
        }else{
          let oData = res[1];
          oData[0].forEach((item:any) => {
            let index = this.lstData.findIndex((x:any)=> x.key == item.key);
            if (index > -1) {
              item.datas.forEach((item2:any) => {
                this.lstData[index].datas.push(item2);
              });
            }else{
              this.lstData.push(item);
            }
          });
          let total = 0;
            this.lstData.forEach((item:any) => {
              total +=item.datas.length;
            });
            if(total == oData[1]) this.isload = false;
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
  //#endregion

  onback(){
    this.navCtrl.navigateBack(this.previousUrl);
  }

  //#endregion

}
