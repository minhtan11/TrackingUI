import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
import { Subject, filter, pairwise, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';

@Component({
  selector: 'app-servicecharge-page',
  templateUrl: './servicecharge-page.component.html',
  styleUrls: ['./servicecharge-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicechargePageComponent  implements OnInit {
  lst1:any;
  lst2:any;
  lst3:any;
  lst4:any;
  previousUrl:any = '';
  private destroy$ = new Subject<void>();
  constructor(
    private navCtrl: NavController,
    private api: ApiserviceComponent,
    private notification: NotificationServiceComponent,
    private dt : ChangeDetectorRef,
    private router: Router,
    private platform : Platform,
    private previous:PreviousRouterServiceService,
  ) { 
  }

  ngOnInit() {
    this.getFeeWeight();
  }

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('main/service-charge'))){
        this.onback();
        return;
      }
      processNextHandler();
    })
  }

  ionViewWillEnter(){
    if (!this.previousUrl) {
      let url = this.previous.getPreviousUrl();
      if (url) {
        let array = url.split('?');
        this.previousUrl = array[0];
      }
    } 
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onback(){
    this.navCtrl.navigateBack(this.previousUrl);
  }

  getFeeWeight(){
    this.api.execByBody('Authencation', 'getfeeweight', null).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.isError) {
        this.lst1 = res.data.filter((x:any) => x.type == 1);
        this.lst2 = res.data.filter((x:any) => x.type == 2);
        this.lst3 = res.data.filter((x:any) => x.type == 3);
        this.lst4 = res.data.filter((x:any) => x.type == 4);
        this.dt.detectChanges();
      }else{
        this.notification.showNotiError('', res?.message);
      }
      this.onDestroy();
    })
  }

  onRefresh(event:any){
    this.getFeeWeight();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }
}
