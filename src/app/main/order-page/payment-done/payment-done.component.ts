import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { AppLauncher } from '@capacitor/app-launcher';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-done',
  templateUrl: './payment-done.component.html',
  styleUrls: ['./payment-done.component.scss'],
})
export class PaymentDoneComponent  implements OnInit {
  platform:any;
  constructor(
    private navCtrl: NavController,
    private notification: NotificationServiceComponent,
    private router:Router,
    private platforms : Platform,
  ) { }

  async ngOnInit() {
    this.platform = await Capacitor.getPlatform();
  }

  ngAfterViewInit() {
    this.platforms.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('main/order/detail'))){
        this.onback();
        return;
      }
      processNextHandler();
    })
  }

  async openGrab(){
    switch(this.platform){
      case 'android':
        let url = 'com.grabtaxi.passenger'
        const { value } = await AppLauncher.canOpenUrl({ url: url });
        if (value) {
          await AppLauncher.openUrl({ url: url });
        } else {
          await Browser.open({
            url: 'https://play.google.com/store/apps/details?id=com.grabtaxi.passenger&hl=vi',
          });
        }
        break;
      case 'ios':
        const scheme = 'grab://';
        const fallback = 'https://apps.apple.com/vn/app/grab-%C4%91%E1%BA%B7t-xe-giao-%C4%91%E1%BB%93-%C4%83n/id647268330?l=vi';
        const now = Date.now();
        window.location.href = scheme;
        setTimeout(() => {
          const elapsed = Date.now() - now;
          if (elapsed < 1500) {
            window.location.href = fallback;
          }
        }, 1000);
        break;
    }
  }

  async openAhamove(){
    switch(this.platform){
      case 'android':
        let url = 'com.ahamove.user'
        const { value } = await AppLauncher.canOpenUrl({ url: url });
        if (value) {
          await AppLauncher.openUrl({ url: url });
        } else {
          await Browser.open({
            url: 'https://play.google.com/store/apps/details?id=com.ahamove.user&hl=vi',
          });
        }
        break;
      case 'ios':
        const scheme = 'ahamove://';
        const fallback = 'https://apps.apple.com/vn/app/ahamove-chuy%C3%AAn-gia-giao-h%C3%A0ng/id987325355?l=vi';
        const now = Date.now();
        window.location.href = scheme;
        setTimeout(() => {
          const elapsed = Date.now() - now;
          if (elapsed < 1500) {
            window.location.href = fallback;
          }
        }, 1000);
        break;
    }
  }

  async openXanhSM(){
    switch(this.platform){
      case 'android':
        let url = 'com.gsm.customer'
        const { value } = await AppLauncher.canOpenUrl({ url: url });
        if (value) {
          await AppLauncher.openUrl({ url: url });
        } else {
          await Browser.open({
            url: 'https://play.google.com/store/apps/details?id=com.gsm.customer&hl=vi',
          });
        }
        break;
      case 'ios':
        const scheme = 'xanhsm.com://';
        const fallback = 'https://apps.apple.com/vn/app/xanh-sm-%C4%91%E1%BA%B7t-xe-%C4%91i%E1%BB%87n/id6446425595?l=vi';
        const now = Date.now();
        window.location.href = scheme;
        setTimeout(() => {
          const elapsed = Date.now() - now;
          if (elapsed < 1500) {
            window.location.href = fallback;
          }
        }, 1000);
        break;
    }
  }

  async openBE(){
    switch(this.platform){
      case 'android':
        let url = 'xyz.be.customer'
        const { value } = await AppLauncher.canOpenUrl({ url: url });
        if (value) {
          await AppLauncher.openUrl({ url: url });
        } else {
          await Browser.open({
            url: 'https://play.google.com/store/apps/details?id=xyz.be.customer&hl=vi',
          });
        }
        break;
      case 'ios':
        const scheme = 'be://';
        const fallback = 'https://apps.apple.com/vn/app/be-n%E1%BB%81n-t%E1%BA%A3ng-%C4%91a-d%E1%BB%8Bch-v%E1%BB%A5/id1440565902?l=vi';
        const now = Date.now();
        window.location.href = scheme;
        setTimeout(() => {
          const elapsed = Date.now() - now;
          if (elapsed < 1500) {
            window.location.href = fallback;
          }
        }, 1000);
        break;
    }
  }

  async openLalamove(){
    switch(this.platform){
      case 'android':
        let url = 'hk.easyvan.app.client'
        const { value } = await AppLauncher.canOpenUrl({ url: url });
        if (value) {
          await AppLauncher.openUrl({ url: url });
        } else {
          await Browser.open({
            url: 'https://play.google.com/store/apps/details?id=hk.easyvan.app.client&hl=vi',
          });
        }
        break;
      case 'ios':
        const scheme = 'lalamove://';
        const fallback = 'https://apps.apple.com/vn/app/lalamove-30-gi%C3%A2y-l%C3%A0-c%C3%B3-xe/id735701965?l=vi';
        const now = Date.now();
        window.location.href = scheme;
        setTimeout(() => {
          const elapsed = Date.now() - now;
          if (elapsed < 1500) {
            window.location.href = fallback;
          }
        }, 1000);
        break;
    }
  }

  async openGHN(){
    switch(this.platform){
      case 'android':
        let url = 'vn.ghn.app.giaohangnhanh'
        const { value } = await AppLauncher.canOpenUrl({ url: url });
        if (value) {
          await AppLauncher.openUrl({ url: url });
        } else {
          await Browser.open({
            url: 'https://play.google.com/store/apps/details?id=vn.ghn.app.giaohangnhanh&hl=vi',
          });
        }
        break;
      case 'ios':
        const scheme = 'ghn://';
        const fallback = 'https://apps.apple.com/vn/app/ghn-giao-h%C3%A0ng-nhanh/id1203171490?l=vi';
        const now = Date.now();
        window.location.href = scheme;
        setTimeout(() => {
          const elapsed = Date.now() - now;
          if (elapsed < 1500) {
            window.location.href = fallback;
          }
        }, 1000);
        break;
    }
  }

  async openGHTK(){
    switch(this.platform){
      case 'android':
        let url = 'vn.giaohangtietkiem.ghtk_pro'
        const { value } = await AppLauncher.canOpenUrl({ url: url });
        if (value) {
          await AppLauncher.openUrl({ url: url });
        } else {
          await Browser.open({
            url: 'https://play.google.com/store/apps/details?id=vn.giaohangtietkiem.ghtk_pro&hl=vi',
          });
        }
        break;
      case 'ios':
        const scheme = 'ghtk://';
        const fallback = 'https://apps.apple.com/vn/app/ghtk/id1131996979?l=vi';
        const now = Date.now();
        window.location.href = scheme;
        setTimeout(() => {
          const elapsed = Date.now() - now;
          if (elapsed < 1500) {
            window.location.href = fallback;
          }
        }, 1000);
        break;
    }
  }

  async openJT(){
    switch(this.platform){
      case 'android':
        let url = 'com.jt.customer.vietnam'
        const { value } = await AppLauncher.canOpenUrl({ url: url });
        if (value) {
          await AppLauncher.openUrl({ url: url });
        } else {
          await Browser.open({
            url: 'https://play.google.com/store/apps/details?id=com.jt.customer.vietnam&hl=vi',
          });
        }
        break;
      case 'ios':
        const scheme = 'jtexpress://';
        const fallback = 'https://apps.apple.com/vn/app/j-t-express-vn/id6449207307?l=vi';
        const now = Date.now();
        window.location.href = scheme;
        setTimeout(() => {
          const elapsed = Date.now() - now;
          if (elapsed < 1500) {
            window.location.href = fallback;
          }
        }, 1000);
        break;
    }
  }

  onCopy(){
    this.notification.showNotiSuccess('','Đã Sao chép',1000);
  }

  onback(){
    this.navCtrl.navigateForward('main/mainpage');
  }
}

