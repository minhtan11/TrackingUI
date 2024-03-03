import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, IonTabs, NavController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage implements OnInit,AfterViewInit {
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private dt : ChangeDetectorRef,
    private platform : Platform,
  ) {
    
   }

  ngOnInit() {
  }

   ngAfterViewInit() {
  }
  

  goHomePage(){
    this.navCtrl.navigateForward(['main/home']);
  }

  goHistoryPage(){
    this.navCtrl.navigateForward(['main/history']);
  }

  goNofiticationPage(){
    this.navCtrl.navigateForward(['main/notification']);
  }

  goSettingPage(){
    this.navCtrl.navigateForward(['main/setting']);
  }
}
