import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-recharge-page',
  templateUrl: './recharge-page.component.html',
  styleUrls: ['./recharge-page.component.scss'],
})
export class RechargePageComponent  implements OnInit {
  previousUrl:any;
  qr1:any;
  qr2:any;
  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private router: Router,
    private previous:PreviousRouterServiceService,
    private storage: StorageService,
  ) { 

  }

  ngOnInit() {
    
  }

  async ionViewWillEnter(){
    let username = await this.storage.get('username');
    this.qr1 = `https://img.vietqr.io/image/vietcombank-1024148679-print.jpg?addInfo=NAP ${username}&accountName=NGUYEN THI MY NGA`;
    this.qr2 = `https://img.vietqr.io/image/vietcombank-1024148679-print.jpg?addInfo=NAP ${username}&accountName=LE TRI DUNG`;

    if (!this.previousUrl) {
      let url = this.previous.getPreviousUrl();
      if (url) {
        let array = url.split('?');
        this.previousUrl = array[0];
      }
    } 
  }

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('main/recharge'))){
        this.onback();
        return;
      }
      processNextHandler();
    })
  }

  onback(){
    this.navCtrl.navigateBack(this.previousUrl);
  }
}
