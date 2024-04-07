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
    private routerOutlet: IonRouterOutlet
  ) {
    this.isReview = this.rt.snapshot.queryParams["isReview"];
   }

  async ngOnInit() {
  }

   ngAfterViewInit() {
    this.dt.detectChanges();
  }

  async ionViewWillEnter(){
    this.routerOutlet.swipeGesture = false; 
    this.isReview = await this.storage.get('isReview');
  }

  selectedTabChange(event:any){
    let tab = event?.tab.textLabel;
    if (tab) {
      switch(tab){
        case 'home':
          this.navCtrl.navigateForward('main/home');
          break;
        case 'history':
          this.navCtrl.navigateForward('main/history');
          break;
        case 'notification':
          this.navCtrl.navigateForward('main/notification');
          break;
        case 'setting':
          this.navCtrl.navigateForward('main/setting');
          break;
      }
    }
   
  }
}
