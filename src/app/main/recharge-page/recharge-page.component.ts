import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-recharge-page',
  templateUrl: './recharge-page.component.html',
  styleUrls: ['./recharge-page.component.scss'],
})
export class RechargePageComponent  implements OnInit {

  constructor(private navCtrl: NavController,) { }

  ngOnInit() {}
  onback(){
    this.navCtrl.navigateBack('main');
  }
}
