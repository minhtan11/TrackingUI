import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-main-home',
  templateUrl: './main-home.page.html',
  styleUrls: ['./main-home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainHomePage implements OnInit,AfterViewInit {
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private dt : ChangeDetectorRef,
  ) { 
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.dt.detectChanges();
  }

  goOrderPage(){
    this.navCtrl.navigateForward('main/order');
  }

  goPackagePage(){
    this.navCtrl.navigateForward('main/package');
  }

  goRechargePage(){
    this.navCtrl.navigateForward('main/recharge');
  }

  goServicechargePage(){
    this.navCtrl.navigateForward('main/service-charge');
  }

}
