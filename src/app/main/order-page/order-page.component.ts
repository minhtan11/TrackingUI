import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPageComponent  implements OnInit,AfterViewInit,OnDestroy,DoCheck {
  height:any;
  constructor(
    private dt : ChangeDetectorRef,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    setTimeout(() => {
      let hheader;
      hheader = (document.querySelector('ion-header') as HTMLElement).clientHeight
      this.height = (window.innerHeight - hheader) + 'px';
      this.dt.detectChanges();
      console.log(this.height);
    }, 50);
  }

  ngAfterViewInit() {

  }

  ngDoCheck() {
    
  }

  ngOnDestroy() {
    
  }

  viewDetail(){
    this.navCtrl.navigateForward('main/order/detail',{queryParams:{orderID:'123456'}});
  }

}
