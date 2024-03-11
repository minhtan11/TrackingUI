import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-recharge-page',
  templateUrl: './recharge-page.component.html',
  styleUrls: ['./recharge-page.component.scss'],
})
export class RechargePageComponent  implements OnInit {
  platform:any = "";
  constructor(private navCtrl: NavController,) { 
    this.platform = Capacitor.getPlatform();
  }

  ngOnInit() {}
  onback(){
    this.navCtrl.navigateBack('main');
  }
}
