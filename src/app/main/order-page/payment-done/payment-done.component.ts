import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppLauncher } from '@capacitor/app-launcher';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

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
  ) { }

  async ngOnInit() {
    this.platform = await Capacitor.getPlatform();
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
        // await Browser.open({
        //   url: 'https://grab.onelink.me/2695613898?af_banner=true&pid=organic_web&c=organic_web&af_adset=grab_website&af_ad=vn&af_channel=smart_banner_pax&af_sub1=open_app&is_retargeting=true&af_dp=grab%3A%2F%2Fopen%3FscreenType%3DMAIN&af_force_deeplink=true&af_sub5=organic',
        // });
        break;
    }
  }

  async openAhamove(){
    let url = this.platform === 'android' ? 'com.ahamove.user' : 'ahamove://';
    const { value } = await AppLauncher.canOpenUrl({ url: url });
    if(value){
      await AppLauncher.openUrl({ url: url });
    }else{
      if(this.platform === 'android')
        await Browser.open({ url: 'https://play.google.com/store/apps/details?id=com.ahamove.user&hl=vi' });
      else
        await Browser.open({ url: 'https://apps.apple.com/vn/app/ahamove-chuy%C3%AAn-gia-giao-h%C3%A0ng/id987325355?l=vi' });
    }
  }

  async openXanhSM(){
    let url = this.platform === 'android' ? 'com.gsm.customer' : 'xanhsm.com://';
    const { value } = await AppLauncher.canOpenUrl({ url: url });
    if(value){
      await AppLauncher.openUrl({ url: url });
    }else{
      if(this.platform === 'android')
        await Browser.open({ url: 'https://play.google.com/store/apps/details?id=com.gsm.customer&hl=vi' });
      else
        await Browser.open({ url: 'https://apps.apple.com/vn/app/xanh-sm-%C4%91%E1%BA%B7t-xe-%C4%91i%E1%BB%87n/id6446425595?l=vi' });
    }
  }

  async openBE(){
    let url = this.platform === 'android' ? 'xyz.be.customer' : 'be://';
    const { value } = await AppLauncher.canOpenUrl({ url: url });
    if(value){
      await AppLauncher.openUrl({ url: url });
    }else{
      if(this.platform === 'android')
        await Browser.open({ url: 'https://play.google.com/store/apps/details?id=xyz.be.customer&hl=vi' });
      else
        await Browser.open({ url: 'https://apps.apple.com/vn/app/be-n%E1%BB%81n-t%E1%BA%A3ng-%C4%91a-d%E1%BB%8Bch-v%E1%BB%A5/id1440565902?l=vi' });
    }
  }

  async openLalamove(){
    let url = this.platform === 'android' ? 'hk.easyvan.app.client' : 'be://';
    const { value } = await AppLauncher.canOpenUrl({ url: url });
    if(value){
      await AppLauncher.openUrl({ url: url });
    }else{
      if(this.platform === 'android')
        await Browser.open({ url: 'https://play.google.com/store/apps/details?id=hk.easyvan.app.client&hl=vi' });
      else
        await Browser.open({ url: 'https://apps.apple.com/vn/app/lalamove-30-gi%C3%A2y-l%C3%A0-c%C3%B3-xe/id735701965?l=vi' });
    }
  }

  async openGHN(){
    let url = this.platform === 'android' ? 'vn.ghn.app.giaohangnhanh' : 'be://';
    const { value } = await AppLauncher.canOpenUrl({ url: url });
    if(value){
      await AppLauncher.openUrl({ url: url });
    }else{
      if(this.platform === 'android')
        await Browser.open({ url: 'https://play.google.com/store/apps/details?id=vn.ghn.app.giaohangnhanh&hl=vi' });
      else
        await Browser.open({ url: 'https://apps.apple.com/vn/app/ghn-giao-h%C3%A0ng-nhanh/id1203171490?l=vi' });
    }
  }

  async openGHTK(){
    let url = this.platform === 'android' ? 'vn.giaohangtietkiem.ghtk_pro' : 'be://';
    const { value } = await AppLauncher.canOpenUrl({ url: url });
    if(value){
      await AppLauncher.openUrl({ url: url });
    }else{
      if(this.platform === 'android')
        await Browser.open({ url: 'https://play.google.com/store/apps/details?id=vn.giaohangtietkiem.ghtk_pro&hl=vi' });
      else
        await Browser.open({ url: 'https://apps.apple.com/vn/app/ghtk/id1131996979?l=vi' });
    }
  }

  async openJT(){
    let url = this.platform === 'android' ? 'com.jt.customer.vietnam' : 'be://';
    const { value } = await AppLauncher.canOpenUrl({ url: url });
    if(value){
      await AppLauncher.openUrl({ url: url });
    }else{
      if(this.platform === 'android')
        await Browser.open({ url: 'https://play.google.com/store/apps/details?id=com.jt.customer.vietnam&hl=vi' });
      else
        await Browser.open({ url: 'https://apps.apple.com/vn/app/j-t-express-vn/id6449207307?l=vi' });
    }
  }
}
