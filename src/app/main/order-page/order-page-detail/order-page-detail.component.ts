import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
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
  private destroy$ = new Subject<void>();
  constructor(
    private navCtrl: NavController,
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
    private storage: StorageService,
    private api : ApiserviceComponent,
  ) { 
    this.oData = JSON.parse(this.rt.snapshot.queryParams['data']);
  }

  async ngOnInit() {
    this.username = await this.storage.get('username');
    this.getDetailPackage();
  }

  ionViewWillEnter(){
    
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

  onback(){
    this.navCtrl.navigateForward('main/order');
  }

  getDetailPackage(){
    let queryParams = new HttpParams();
    queryParams = queryParams.append("id", this.oData.id);
    this.api.execByParameter('Authencation', 'getlistpackage', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.lstPackage = res;
        this.dt.detectChanges();
      }
    })
  }

}
