import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Network } from '@capacitor/network';
import { InfiniteScrollCustomEvent, IonRouterOutlet, NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPageComponent {
  //#region Contrucstor
  pageSize: any = 20;
  lstData: any;
  pageNum: any = 1;
  fromDate: any = null;
  toDate: any = null;
  status: any = 0;
  id: any;
  isEmpty: any = false;
  isload: any = true;
  firstLoad:any = true;
  private destroy$ = new Subject<void>();
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private routerOutlet: IonRouterOutlet
  ) { }
  //#endregion

  //#region Init
  ngOnInit() {
  }

  ngAfterViewInit(){
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
    this.init();
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
    if(!this.firstLoad) return;
    this.lstData = [];
    this.dt.detectChanges();
    this.loadDataHis();
  }

  async loadDataHis(isShowLoad:any=true){
    let username = await this.storage.get('username');
    let data = {
      status: this.status,
      id: this.id,
      //fromDate: this.fromDate,
      //toDate: this.toDate,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      userName: username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    if (isShowLoad) {
      this.api.isLoad(true);
      setTimeout(() => {
        this.api.execByBody('Authencation', 'historywallet', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
          next: (res: any) => {
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
              if (this.firstLoad) this.firstLoad = false;
            }
          },
          complete: () => {
            this.dt.detectChanges();
            this.api.isLoad(false);
          }
        })
      }, 1000);
    }else{
      this.api.execByBody('Authencation', 'historywallet', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
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
            if (this.firstLoad) this.firstLoad = false;
          }
        },
        complete: () => {
          this.dt.detectChanges();
        }
      })
    }
  }

  sortDataHis(status: any) {
    if(this.status == status) return;
    this.status = status;
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.dt.detectChanges();
    this.loadDataHis();
  }

  async onIonInfiniteHis(event: any) {
    if (this.isload) {
      let username = await this.storage.get('username');
      this.pageNum += 1;
      let data = {
        status: this.status,
        id: this.id,
        //fromDate: this.fromDate,
        //toDate: this.toDate,
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
            this.dt.detectChanges();
          }, 500);
        }
      })
    }
  }
  //#endregion

}
