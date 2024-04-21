import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet, IonTabs, NavController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StorageService } from '../storage-service/storage.service';
import { Clipboard, ReadResult } from '@capacitor/clipboard';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage implements OnInit,AfterViewInit {
  isReview:any;
  isOpen:any=false;
  isDismiss:any=false;
  textCopy:any = '';
  constructor(
    private navCtrl: NavController,
    private dt : ChangeDetectorRef,
    private storage: StorageService,
    private rt : ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private platform : Platform,
  ) {
    this.isReview = this.rt.snapshot.queryParams["isReview"];
   }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.platform.resume.subscribe(async () => {
        Clipboard.read().then((clipboardRead: ReadResult) => {
          if (clipboardRead?.value) {
            this.isOpen = true;
            this.isDismiss = false;
            this.textCopy = clipboardRead?.value;
            this.dt.detectChanges();
            return;
          }
        });
      });
    })
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
  onAccept(){
    this.onCancel();
    this.navCtrl.navigateForward('main/package/create',{queryParams:{code:this.textCopy}});
  }

  onCancel(){
    this.isDismiss = true;
    this.isOpen = false;
    Clipboard.write({
      string: ""
    });
    this.dt.detectChanges();
  }
}
