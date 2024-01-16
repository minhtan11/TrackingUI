import { Injectable } from '@angular/core';
import { StorageService } from '../storage-service/storage.service';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CheckTenantService {

  constructor(
    private storage: StorageService,
    private navCtrl: NavController,
  ) { }

  async init(){
    let oUser = await this.storage.get('oUser');
    if (oUser) {
      this.navCtrl.navigateForward('main',{queryParams:{oUser:oUser}});
    }else{
      this.navCtrl.navigateForward('home');
    }
  }
}
