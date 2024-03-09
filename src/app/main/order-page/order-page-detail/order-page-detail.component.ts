import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-order-page-detail',
  templateUrl: './order-page-detail.component.html',
  styleUrls: ['./order-page-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPageDetailComponent  implements OnInit {
  oData:any;
  username:any;
  lstPackage:any;
  arrayChange:any=[];
  private destroy$ = new Subject<void>();
  constructor(
    private navCtrl: NavController,
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
    private storage: StorageService,
    private api : ApiserviceComponent,
    private notification: NotificationServiceComponent,
  ) { 
    this.oData = JSON.parse(this.rt.snapshot.queryParams['data']);
  }

  async ngOnInit() {
    this.username = await this.storage.get('username');
  }

  ionViewWillEnter(){
    this.getDetailPackage();
  }

  ionViewWillLeave(){
    this.onDestroy();
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByFn(index:any, item:any) { 
    return index; 
  }

  onPayment(){
    let data = {
      id: this.oData.id,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'payment', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res.isError) {
        this.oData = res.data;
        this.arrayChange.push(res.data);
        this.notification.showNotiSuccess('',res.message);
        this.dt.detectChanges();
      }else{
        this.notification.showNotiError('',res.message);
      }
      this.onDestroy();
    })
  }

  onback(){
    if (this.arrayChange.length) {
      this.navCtrl.navigateBack('main/order',{queryParams:{type:'change',lstdata:JSON.stringify(this.arrayChange)}});
    }else{
      this.navCtrl.navigateBack('main/order',{queryParams:{type:'default'}});
    }
  }

  getDetailPackage(){
    let data = {
      id: this.oData.id,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'getlistpackage', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      }else{
        this.lstPackage = res[1];
        this.onDestroy();
        this.dt.detectChanges();
      }
    })
  }
}
