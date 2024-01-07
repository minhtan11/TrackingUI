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
  isHideFooter:any=false;
  constructor(
    private dt : ChangeDetectorRef,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
      this.dt.detectChanges();
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
      this.dt.detectChanges();
    });
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
