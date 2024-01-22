import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { StorageService } from './storage-service/storage.service';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from './apiservice/apiservice.component';
import { Subject, takeUntil } from 'rxjs';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  isload:any=true;
  private destroy$ = new Subject<void>();
  constructor(
    private platform : Platform,
    private storage: StorageService,
    private api: ApiserviceComponent,
    private navCtrl: NavController,
    private dt : ChangeDetectorRef,
    private router:Router
  ) {}

  async ngOnInit() {
    this.platform.ready().then(async () => {
      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
    });
    this.checkLogin();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async checkLogin(){
    let username = await this.storage.get('username');
    let password = await this.storage.get('password');
    if (username && password) {
      this.navCtrl.navigateForward('main');
      setTimeout(() => {
        this.isload = false;
        this.dt.detectChanges();
      }, 2000);
      // let queryParams = new HttpParams();
      // queryParams = queryParams.append("userName", username);
      // queryParams = queryParams.append("passWord", password);
      // this.api.execByParameter('Authencation', 'login', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      //   if (res && !res?.isError) {
      //     this.navCtrl.navigateForward('main', {queryParams:{oUser: JSON.stringify(res.data)}});
      //     this.onDestroy();
      //     setTimeout(() => {
      //       this.isload = false;
      //       this.dt.detectChanges();
      //     }, 2000);
      //   } else {
      //     this.navCtrl.navigateForward('home');
      //     setTimeout(() => {
      //       this.isload = false;
      //       this.dt.detectChanges();
      //     }, 2000);
      //   }
      // })
    }else{
      this.navCtrl.navigateForward('home');
      setTimeout(() => {
        this.isload = false;
        this.dt.detectChanges();
      }, 2000);
    }
  }
}
