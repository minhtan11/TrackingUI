import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-servicecharge-page',
  templateUrl: './servicecharge-page.component.html',
  styleUrls: ['./servicecharge-page.component.scss'],
})
export class ServicechargePageComponent  implements OnInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {}

  onback(){
    this.navCtrl.navigateBack('main');
  }

}
