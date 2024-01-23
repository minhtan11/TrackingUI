import { HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPageComponent  implements OnInit,AfterViewInit {
  //#region Contrucstor
  @ViewChild(IonContent) content: IonContent;
  pageNum:any = 1;
  pageSize:any = 10;
  fromDate:any = null;
  toDate:any = null;
  username:any;
  status:any = 0;
  id:any='';
  lstData:any = [];
  isEmpty:any = false;
  isExec:any=false;
  total:any = 0;
  isload:any=true;
  isloadpage:any=false;
  private destroy$ = new Subject<void>();
  constructor(
    private dt : ChangeDetectorRef,
    private api : ApiserviceComponent,
    private rt : ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
  ) { 
  }
  //#endregion

  //#region Init

  async ngOnInit() {
    this.username = await this.storage.get('username');
    this.isloadpage = true;
    this.dt.detectChanges();
      setTimeout(() => {
        this.loadData();
      }, 500);
  }

  ngAfterViewInit() {

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

  trackByFn(index:any, item:any) { 
    return index; 
  }

  sortData(status:any){
    if(this.status == status) return;
    this.status = status;
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


  loadData(){
    let queryParams = new HttpParams();
    queryParams = queryParams.append("status", this.status);
    queryParams = queryParams.append("id", this.id);
    queryParams = queryParams.append("fromDate", this.fromDate);
    queryParams = queryParams.append("toDate", this.toDate);
    queryParams = queryParams.append("pageNum", this.pageNum);
    queryParams = queryParams.append("pageSize", this.pageSize);
    queryParams = queryParams.append("userName", this.username);
    this.api.execByParameter('Authencation', 'order', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        res[0].forEach((data: any) => {
          this.lstData.push(data);
        });
        this.isloadpage = false;
        if (this.lstData.length == 0) this.isEmpty = true;
        if (this.lstData.length == res[1]) this.isload = false;
        this.dt.detectChanges();
        console.log(this.lstData);
      }
      this.onDestroy();
    })
  }

  viewDetail(){
    this.navCtrl.navigateForward('main/order/detail',{queryParams:{orderID:'123456'}});
  }

  onback(){
    this.navCtrl.navigateForward('main');
  }

  onCopy(){
    
  }

  //#endregion
}
