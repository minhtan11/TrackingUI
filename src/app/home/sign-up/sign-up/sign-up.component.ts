import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent  implements OnInit,AfterViewInit {
  showPass:any = false;
  isHideFooter:any=false;
  constructor(
    private dt : ChangeDetectorRef,
    private navCtrl: NavController
  ) { }

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

  onSignUp(){

  }

  goSignInPage(){}

}
