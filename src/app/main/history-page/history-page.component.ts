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
export class HistoryPageComponent implements OnInit {
  //#region Contrucstor
  pageNum: any = 1;
  pageSize: any = 20;
  fromDate: any = null;
  toDate: any = null;
  username: any;
  status: any = 0;
  id: any;
  lstData: any = [];
  isEmpty: any = false;
  isload: any = true;
  isloadpage: any = false;
  isconnected:any;
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

  async ionViewWillEnter(){
    let status: any = await Network.getStatus();
    this.isconnected = status.connected;
    if (status.connected && status.connectionType != 'none') {
      this.init();
    }
    this.dt.detectChanges();
  }

  ionViewDidEnter() {
    this.routerOutlet.swipeGesture = false;
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillLeave(){
    this.routerOutlet.swipeGesture = true;
    this.onDestroy();
  }
  //#endregion

  //#region Function
  trackByFn(index: any, item: any) {
    return index;
  }

  sortData(status: any) {
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

  loadData() {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("status", this.status);
    queryParams = queryParams.append("id", this.id);
    queryParams = queryParams.append("fromDate", this.fromDate);
    queryParams = queryParams.append("toDate", this.toDate);
    queryParams = queryParams.append("pageNum", this.pageNum);
    queryParams = queryParams.append("pageSize", this.pageSize);
    queryParams = queryParams.append("userName", this.username);
    this.api.execByParameter('Authencation', 'historywallet', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.lstData = res[0];
        console.log(res)
        if (this.lstData.length == 0) this.isEmpty = true;
        if (this.lstData.length == res[1]) this.isload = false;
      }
      this.isloadpage = false;
      this.onDestroy();
      this.dt.detectChanges();
    })
  }

  onIonInfinite(event: any) {
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
      this.api.execByParameter('Authencation', 'historywallet', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
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

  async init(){
    this.username = await this.storage.get('username');
    this.lstData = [];
    this.isloadpage = true;
    this.dt.detectChanges();
    setTimeout(() => {
      this.loadData();
    }, 500);
  }
  //#endregion

}
