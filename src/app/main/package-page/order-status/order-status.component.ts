import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusComponent  implements OnInit {
  oData:any;
  oPack:any;
  username:any;
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
  ) { 
    
   
  }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
        if ((this.router.url.includes('/main/package/orderstatus'))) {
          this.navCtrl.navigateBack('main',{queryParams:{selected:0}});
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
    this.dt.detectChanges();
    this.getPackage();
  }

  onBack(){
    this.navCtrl.navigateBack('main',{queryParams:{selected:0}});
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
        this.dt.detectChanges();
      }
      this.onDestroy();
    })
  }

  changeAutoQuery(check:any){
    let data = {
      id: this.oPack.id,
      check: check
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'changeautoquery', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          } else {
            if (res[1].isError) {
              this.notification.showNotiError('', res[1].message);
            }else{
              this.notification.showNotiSuccess('', res[1].message);
              this.oPack.autoQuery = check;
              this.dt.detectChanges();
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
}
