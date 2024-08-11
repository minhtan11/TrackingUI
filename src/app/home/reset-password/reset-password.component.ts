import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Keyboard } from '@capacitor/keyboard';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent  implements OnInit {
  @ViewChild('eleCode') eleCode: any;
  @ViewChild('eleNewPassword') eleNewPassword: any;
  @ViewChild('eleConfirmPassword') eleConfirmPassword: any;
  isHideFooter:any=false;
  formGroup!: FormGroup;
  showPass1:any=false;
  showPass2:any=false;
  showPass3:any=false;
  previousUrl:any;
  lastBack:any = Date.now();
  isOpenExit:any=false;
  userName:any=''
  private destroy$ = new Subject<void>();
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private formBuilder: FormBuilder,
    private previous:PreviousRouterServiceService,
    private platform : Platform,
    private router:Router,
  ) { }

  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      code: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      userName:[''],
    });
    let username = await this.storage.get('username');
    this.userName = username;
    this.formGroup.patchValue({userName:username});
  }

  async ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
      
    });
    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
      
    });
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('home/resetpassword'))){
        if (Date.now() - this.lastBack < 500) { // logic for double tap: delay of 500ms between two clicks of back button
          this.isOpenExit = true;
        }
        this.lastBack= Date.now();
        return;
      }
      processNextHandler();
    })
  }

  onfocus(ele:any){
    if (ele) {
      ele.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }

  onExit(){
    this.cancelExit();
    App.exitApp();
  }

  cancelExit(){
    this.isOpenExit = false;
    this.dt.detectChanges();
  }

  onChange(){
    if (this.formGroup.controls['code'].invalid) {
      this.notification.showNotiError('', 'Mã OTP không được bỏ trống!');
      this.eleCode.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['newPassword'].invalid) {
      this.notification.showNotiError('', 'Mật khẩu mới không được bỏ trống!');
      this.eleNewPassword.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['confirmPassword'].invalid) {
      this.notification.showNotiError('', 'Mật khẩu mới không được bỏ trống!');
      this.eleConfirmPassword.nativeElement.focus();
      return;
    }
    if (this.formGroup.value.newPassword != this.formGroup.value.confirmPassword) {
      this.notification.showNotiError('', 'Mật khẩu không khớp!');
      this.eleConfirmPassword.nativeElement.focus();
      return;
    }
    let oData = this.formGroup.getRawValue();
    let userName = this.userName;
    let password = oData?.newPassword;
    let code = oData?.code;
    let data = {
      userName:userName,
      password:password,
      code:code,
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation','changepasswordwithotp',messageBody).pipe(takeUntil(this.destroy$)).subscribe(async (res:any)=>{
      if (res && !res?.isError) {
        this.notification.showNotiSuccess('', res.message);
        let oData = this.formGroup.getRawValue();
        let userName = this.userName;
        let passWord = oData?.newPassword;
        let token = await this.storage.get('token');
        const info = await Device.getInfo();
        const infoID = await Device.getId();
        let deviceName = info.manufacturer + ' ' + info.model;
        let deviceID = infoID.identifier;
        let data = {
          userName: userName,
          passWord: passWord,
          token: token,
          deviceName: deviceName,
          deviceID: deviceID
        }
        let messageBody = {
          dataRequest: JSON.stringify(data)
        };
        this.api.execByBody('Authencation', 'login', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe(async (res:any)=>{
          if (res && !res?.isError) {
            this.storage.set('username', userName.trim());
            this.storage.set('password', passWord.trim());
            this.storage.set('isLogin', true);
            await this.storage.setAccount(userName);
            this.navCtrl.navigateForward('main/mainpage',{queryParams:{checklogin:false}});
          } else {
            this.notification.showNotiError('', res?.message);
          }
        })
      }else{
        this.notification.showNotiError('',res?.message);
      }
    })
  }
}
