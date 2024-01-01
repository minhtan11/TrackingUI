import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Keyboard } from '@capacitor/keyboard';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit,AfterViewInit {
  showPass:any = false;
  
  constructor(
    private dt : ChangeDetectorRef,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    
  }

  showPassword(){
    this.showPass = !this.showPass;
  }

  onSignIn(){
    this.navCtrl.navigateForward('main');
  }

  

  goSignUpPage(){
    this.navCtrl.navigateForward('home/signup');
  }

}
