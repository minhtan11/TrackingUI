import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss'],
})
export class OrderStatusComponent  implements OnInit {
  oData:any;
  oPack:any;
  username:any;
  isOpenPopupAuto:any = false;
  previousUrl:any;
  private destroy$ = new Subject<void>();
  constructor(
    private dt : ChangeDetectorRef,
    private rt : ActivatedRoute,
    private navCtrl: NavController,
    private platform : Platform,
    private router: Router,
    private storage: StorageService,
    private api : ApiserviceComponent,
    private notification: NotificationServiceComponent,
    private previous:PreviousRouterServiceService
  ) { 
    
   
  }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
        if ((this.router.url.includes('/main/package/orderstatus'))) {
          this.onBack();
        }else{
          processNextHandler();
        }
      });
    })
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    if(!this.username) this.username = await this.storage.get('username');
    let data = JSON.parse(this.rt.snapshot.queryParams['data']);
    if(data) this.oData = data;
    
    this.getPackage();
    if (!this.previousUrl) {
      let url = this.previous.getPreviousUrl();
      if (url) {
        let array = url.split('?');
        this.previousUrl = array[0];
      }
    } 
  }

  onBack(){
    if(this.oPack){
      if(!this.oPack.autoQuery){
        this.openPopupAuto();
      }else{
        if(this.previousUrl.includes('/main/package/detail')){
          this.navCtrl.navigateBack(this.previousUrl,{queryParams:{type:'change',dataUpdate:JSON.stringify(this.oPack)}});
          return;
        }
        if(this.previousUrl.includes('/main/package')){
          this.navCtrl.navigateBack(this.previousUrl,{queryParams:{type:'change',dataUpdate:JSON.stringify(this.oPack)}});
          return;
        }
        this.navCtrl.navigateBack(this.previousUrl);
      }
    }
  }

  getPackage(){
    let data = {
      id: this.oData.key,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'getonepackage', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res[0]) {
      } else {
        if(res[1]) this.oPack = res[1];
      }
      this.onDestroy();
    })
  }

  openPopupAuto(){
    this.isOpenPopupAuto = true;
  }
  
  cancelPopupAuto(isReturn:any = false){
    this.isOpenPopupAuto = false;
    this.dt.detectChanges();
    if(isReturn){
      if(this.previousUrl.includes('/main/package/detail')){
        this.navCtrl.navigateBack(this.previousUrl,{queryParams:{type:'change',dataUpdate:JSON.stringify(this.oPack)}});
        return;
      }
      if(this.previousUrl.includes('/main/package')){
        this.navCtrl.navigateBack(this.previousUrl,{queryParams:{type:'change',dataUpdate:JSON.stringify(this.oPack)}});
        return;
      }
      this.navCtrl.navigateBack(this.previousUrl);
    }
    
  }

  changeAutoQuery(check:any){
    this.cancelPopupAuto();
    let data = {
      id: this.oPack.id,
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
          this.oPack.autoQuery = check;
        }
      }
      this.onDestroy();
    })
  }
}
