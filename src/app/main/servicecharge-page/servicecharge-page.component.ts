import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-servicecharge-page',
  templateUrl: './servicecharge-page.component.html',
  styleUrls: ['./servicecharge-page.component.scss'],
})
export class ServicechargePageComponent  implements OnInit {
  platform:any = "";
  constructor(private navCtrl: NavController) { 
    this.platform = Capacitor.getPlatform();
  }

  ngOnInit() {}

  onback(){
    this.navCtrl.navigateBack('main');
  }

}
