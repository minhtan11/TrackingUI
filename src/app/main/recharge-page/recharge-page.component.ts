import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';

@Component({
  selector: 'app-recharge-page',
  templateUrl: './recharge-page.component.html',
  styleUrls: ['./recharge-page.component.scss'],
})
export class RechargePageComponent  implements OnInit {
  previousUrl:any;
  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private router: Router,
    private previous:PreviousRouterServiceService,
  ) { 

  }

  ngOnInit() {
    
  }

  async ionViewWillEnter(){
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
