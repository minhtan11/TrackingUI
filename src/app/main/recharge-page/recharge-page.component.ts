import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-recharge-page',
  templateUrl: './recharge-page.component.html',
  styleUrls: ['./recharge-page.component.scss'],
})
export class RechargePageComponent  implements OnInit {
  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private router: Router,
  ) { 

  }

  ngOnInit() {
    
  }
  onback(){
    this.navCtrl.navigateBack('main');
  }
}
