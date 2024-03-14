import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet, IonTabs, NavController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StorageService } from '../storage-service/storage.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage implements OnInit,AfterViewInit {
  isReview:any;
  constructor(
    private navCtrl: NavController,
    private dt : ChangeDetectorRef,
    private storage: StorageService,
    private rt : ActivatedRoute,
  ) {
    this.isReview = this.rt.snapshot.queryParams["isReview"];
   }

  async ngOnInit() {
  }

   ngAfterViewInit() {
    this.dt.detectChanges();
  }

  async ionViewWillEnter(){
    
  }
  

  goHomePage(){
    this.navCtrl.navigateForward('main/home');
  }

  goHistoryPage(){
    this.navCtrl.navigateForward('main/history');
  }

  goNofiticationPage(){
    this.navCtrl.navigateForward('main/notification');
  }

  goSettingPage(){
    this.navCtrl.navigateForward('main/setting',{queryParams:{isReview:this.isReview}});
  }
}
