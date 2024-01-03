import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent  implements OnInit,AfterViewInit,OnDestroy {
  isload:any = false;
  private destroy$ = new Subject<void>();
  constructor(
    private dt : ChangeDetectorRef,
    private navCtrl: NavController
  ) { }

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.isload = true;
      this.dt.detectChanges();
    }, 10);
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  goOrderPage(){
    this.navCtrl.navigateForward('main/order');
  }

}
