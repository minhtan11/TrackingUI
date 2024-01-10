import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';

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
  private destroy$ = new Subject<void>();
  constructor(
    private router: Router,
    private dt : ChangeDetectorRef,
    private rt : ActivatedRoute,
    private navCtrl: NavController,
  ) { 
    this.rt.queryParams.subscribe((params :any) => {
      this.oUser = JSON.parse(params.oUser);
    })
  }
  //#endregion

  //#region Init
  ngOnInit() {
    this.getTime();
  }

  ngAfterViewInit(): void {
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
    this.router.navigate(['main/order']);
  }

  goPackagePage(){
    this.router.navigate(['main/package']);
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
