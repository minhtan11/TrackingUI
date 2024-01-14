import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { SplashScreen } from '@capacitor/splash-screen';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent  implements OnInit,AfterViewInit {
  //#region Contrucstor
  oUser:any;
  titleTime:any = '';
  ship1:any;
  ship2:any;
  pack3:any;
  pack5:any;
  isload:any = true;
  private destroy$ = new Subject<void>();
  constructor(
    private router: Router,
    private dt : ChangeDetectorRef,
    private rt : ActivatedRoute,
    private navCtrl: NavController,
    private platform : Platform,
    private api : ApiserviceComponent
  ) { 
    this.oUser = JSON.parse(this.rt.snapshot.queryParams['oUser']);
    let queryParams = new HttpParams();
      queryParams = queryParams.append("userName", this.oUser.username);
      this.api.execByParameter('Authencation', 'dashboard', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          this.pack3 = res[0][0];
          this.pack5 = res[0][2];
          this.ship1 = res[1][0];
          this.ship2 = res[1][1];
          this.dt.detectChanges();
        }
      })
  }
  //#endregion

  //#region Init
  ngOnInit() {
    this.getTime();
  }

  ngAfterViewInit(){
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Function
  goOrderPage(){
    this.navCtrl.navigateForward('main/order',{queryParams:{username:this.oUser.username}});
  }

  goPackagePage(){
    this.onDestroy();
    this.navCtrl.navigateForward('main/package',{queryParams:{username:this.oUser.username}});
  }

  goRechargePage(){
    this.router.navigate(['main/recharge']);
  }

  goServicechargePage(){
    this.router.navigate(['main/service-charge']);
  }
  getTime(){
    let today = new Date()
    let curHr = today.getHours()
    let time = null;

    if (curHr < 12) {
      this.titleTime = "Chào buổi sáng!";
    } else if (curHr < 18) {
      this.titleTime = "Chào buổi chiều!";
    } else {
      this.titleTime = "Chào buổi tối";
    }
    this.dt.detectChanges();
  }
  //#endregion

}
