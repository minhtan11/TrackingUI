import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet, IonTabs, NavController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StorageService } from '../storage-service/storage.service';
import { Clipboard, ReadResult } from '@capacitor/clipboard';
import { ApiserviceComponent } from '../apiservice/apiservice.component';
import { Subject, takeUntil } from 'rxjs';
import { Device } from '@capacitor/device';

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
  selected:any = 0;
  private destroy$ = new Subject<void>();
  constructor(
    private navCtrl: NavController,
    private dt : ChangeDetectorRef,
    private storage: StorageService,
    private rt : ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private platform : Platform,
    private api: ApiserviceComponent,
  ) {
    this.isReview = this.rt.snapshot.queryParams["isReview"];
   }

  ngOnInit() {
    this.platform.ready().then(async () => {
      let checklogin = this.rt.snapshot.queryParams["checklogin"];
      if (checklogin) {
        this.onCheckLogin();
      }
      this.platform.resume.subscribe(async () => {
        this.onCheckLogin();
        Clipboard.read().then((clipboardRead: ReadResult) => {
          if (clipboardRead?.value) {
            this.isOpen = true;
            this.isDismiss = false;
            let value = clipboardRead?.value;
            this.textCopy = value.replace(/(\r\n\s|\r|\n|\s)/g, ',');
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

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    let selected = this.rt.snapshot.queryParams["selected"];
    if (selected != null) {
      this.selected = selected;
      this.dt.detectChanges();
    }
    this.routerOutlet.swipeGesture = false; 
    this.isReview = await this.storage.get('isReview');
  }

  selectedTabChange(event:any){
    let tab = event?.tab.textLabel;
    if (tab) {
      switch(tab){
        case 'home':
          this.selected = 0;
          this.navCtrl.navigateForward('main/mainpage');
          break;
        case 'history':
          this.selected = 1;
          this.navCtrl.navigateForward('main/history');
          break;
        case 'notification':
          this.selected = 2;
          this.navCtrl.navigateForward('main/notification');
          break;
        case 'setting':
          this.selected = 3;
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

  async onCheckLogin(){
    let token = await this.storage.get('token');
    const info = await Device.getInfo();
    const infoID = await Device.getId();
    let deviceName = info.manufacturer+' '+info.model;
    let deviceID = infoID.identifier;
    let username = await this.storage.get('username');
    let data = {
      userName: username,
      token: token,
      deviceName: deviceName,
      deviceID: deviceID
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'checklogin', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res && res?.isError) {
        this.isOpen = false;
        this.isDismiss = false;
        this.storage.remove('isLogin');
        this.navCtrl.navigateBack('home',{queryParams:{loginError:JSON.stringify(res)}});
        this.dt.detectChanges();
        this.onDestroy();
      }
    })
  }
}
