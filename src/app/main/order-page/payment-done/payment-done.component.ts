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
    let fallback = '';
    let url = '';
    switch(this.platform){
      case 'android':
        fallback = 'https://play.google.com/store/apps/details?id=com.grabtaxi.passenger&hl=vi';
        url = 'com.grabtaxi.passenger';
        this.goOpenAppAndroid(url,fallback);
        break;
      case 'ios':
        fallback = 'https://apps.apple.com/vn/app/grab-%C4%91%E1%BA%B7t-xe-giao-%C4%91%E1%BB%93-%C4%83n/id647268330?l=vi';
        this.goOpenAppIOS('grab://',fallback);
        break;
    }
  }

  async openAhamove(){
    let fallback = '';
    let url = '';
    switch(this.platform){
      case 'android':
        fallback = 'https://play.google.com/store/apps/details?id=com.ahamove.user&hl=vi';
        url = 'com.ahamove.user';
        this.goOpenAppAndroid(url,fallback);
        break;
      case 'ios':
        fallback = 'https://apps.apple.com/vn/app/ahamove-chuy%C3%AAn-gia-giao-h%C3%A0ng/id987325355?l=vi';
        this.goOpenAppIOS('ahamove://',fallback);
        break;
    }
    
  }

  async openXanhSM(){
    let fallback = '';
    let url = '';
    switch(this.platform){
      case 'android':
        fallback = 'https://play.google.com/store/apps/details?id=com.gsm.customer&hl=vi';
        url = 'com.gsm.customer';
        this.goOpenAppAndroid(url,fallback);
        break;
      case 'ios':
        fallback = 'https://apps.apple.com/vn/app/xanh-sm-%C4%91%E1%BA%B7t-xe-%C4%91i%E1%BB%87n/id6446425595?l=vi';
        this.goOpenAppIOS('xanhsm.com://',fallback);
        break;
    }
  }

  async openBE(){
    let fallback = '';
    let url = '';
    switch(this.platform){
      case 'android':
        fallback = 'https://play.google.com/store/apps/details?id=xyz.be.customer&hl=vi';
        url = 'xyz.be.customer';
        this.goOpenAppAndroid(url,fallback);
        break;
      case 'ios':
        fallback = 'https://apps.apple.com/vn/app/be-n%E1%BB%81n-t%E1%BA%A3ng-%C4%91a-d%E1%BB%8Bch-v%E1%BB%A5/id1440565902?l=vi';
        this.goOpenAppIOS('be://',fallback);
        break;
    }
  }

  async openLalamove(){
    let fallback = '';
    let url = '';
    switch(this.platform){
      case 'android':
        fallback = 'https://play.google.com/store/apps/details?id=hk.easyvan.app.client&hl=vi';
        url = 'hk.easyvan.app.client';
        this.goOpenAppAndroid(url,fallback);
        break;
      case 'ios':
        fallback = 'https://apps.apple.com/vn/app/lalamove-30-gi%C3%A2y-l%C3%A0-c%C3%B3-xe/id735701965?l=vi';
         this.goOpenAppIOS('lalamove://',fallback);
        break;
    }
   
  }

  async openGHN(){
    let fallback = '';
    let url = '';
    switch(this.platform){
      case 'android':
        fallback = 'https://play.google.com/store/apps/details?id=vn.ghn.app.giaohangnhanh&hl=vi';
        url = 'vn.ghn.app.giaohangnhanh';
        this.goOpenAppAndroid(url,fallback);
        break;
      case 'ios':
        fallback = 'https://apps.apple.com/vn/app/ghn-giao-h%C3%A0ng-nhanh/id1203171490?l=vi';
        this.goOpenAppIOS('ghn://',fallback);
    }
    
  }

  async openGHTK(){
    let fallback = '';
    let url = '';
    switch(this.platform){
      case 'android':
        fallback = 'https://play.google.com/store/apps/details?id=vn.giaohangtietkiem.ghtk_pro&hl=vi';
        url = 'vn.giaohangtietkiem.ghtk_pro';
        this.goOpenAppAndroid(url,fallback);
        break;
      case 'ios':
        fallback = 'https://apps.apple.com/vn/app/ghtk/id1131996979?l=vi';
        this.goOpenAppIOS('ghtk://',fallback);
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

  async openViettelPost(){
    let fallback = '';
    let url = 'com.viettel.ViettelPost';
    switch(this.platform){
      case 'android':
        fallback = 'https://play.google.com/store/apps/details?id=com.viettel.ViettelPost&hl=vi';
        this.goOpenAppAndroid(url,fallback);
        break;
      case 'ios':
        fallback = 'https://apps.apple.com/vn/app/viettel-post/id1398283517?l=vi';
        this.goOpenAppIOS('viettelpost://',fallback);
        break;
    }
  }

  onCopy(){
    this.notification.showNotiSuccess('','Đã Sao chép',1000);
  }

  onback(){
    this.navCtrl.navigateForward('main/mainpage');
  }

  async goOpenAppAndroid(url:any,fallback:any){
    const { value } = await AppLauncher.canOpenUrl({ url: url });
    if (value) {
      await AppLauncher.openUrl({ url: url });
    } else {
      await Browser.open({
        url: fallback,
      });
    }
  }

  goOpenAppIOS(scheme:any,fallback:any){
    let now = Date.now();
    window.location.href = scheme;
    setTimeout(() => {
      const elapsed = Date.now() - now;
      if (elapsed < 1500) {
        window.location.href = fallback;
      }
    }, 1000);
  }
}

