import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { NotificationServiceComponent } from '../notification-service/notification-service.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from '../apiservice/apiservice.component';
import { StorageService } from '../storage-service/storage.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { environment } from 'src/environments/environment';
import { BiometricAuthError, BiometryType, NativeBiometric } from "capacitor-native-biometric";
import { Device } from '@capacitor/device';
import { PreviousRouterServiceService } from '../previous-router-service/previous-router-service.service';
import { App } from '@capacitor/app';
import { Badge } from '@capawesome/capacitor-badge';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  //#region Contrucstor
  @ViewChild('eleUserName') eleUserName: any;
  @ViewChild('elePassword') elePassword: any;
  showPass: any = false;
  isHideFooter: any = false;
  isError: any = false;
  messageError: any;
  formGroup!: FormGroup;
  isLogin: any = true;
  userName:any;
  isAuthen:any = false;
  isChangeAccount:any = false;
  dataLoginError:any;
  isOpenLoginError:any=false;
  isOpenDeleteAccount:any=false;
  isOpenSigin:any=false;
  faceID:any;
  oUser:any;
  listUser:any = [];
  lastBack:any = Date.now();
  accountSelected:any;
  isReview:any;
  isOpenExit:any=false;
  totalNoti:any=0;
  versionNew:any='2.6';
  versisonCurrent:any='';
  private destroy$ = new Subject<void>();
  constructor(
    private router: Router,
    private dt: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private notification: NotificationServiceComponent,
    private api: ApiserviceComponent,
    private storage: StorageService,
    private rt: ActivatedRoute,
    private navCtrl: NavController,
    private platform : Platform,
    private alertController: AlertController,
    private previous:PreviousRouterServiceService,
  ) {
    
  }
  //#endregion

  //#region Init
  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      userName: ['', Validators.required],
      passWord: ['', Validators.required]
    });
    this.versisonCurrent = await this.storage.get('versionNo');
    // let username = await this.storage.get('username');
    
    // if(username){
    //   this.userName = username;
    //   this.formGroup.patchValue({userName:this.userName});
    //   this.isAuthen = true;
    //  
    // } 
  }

  async ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
    });
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      let array = this.router.url.split('?');
      let url = array[0];
      if((url.includes('home'))){
        if((!url.includes('home/signup')) && (!url.includes('home/forgotpassword')) && (!url.includes('home/resetpassword'))){
          if (Date.now() - this.lastBack < 500) { // logic for double tap: delay of 500ms between two clicks of back button
            this.isOpenExit = true;
          }
          this.lastBack= Date.now();
          return;
        }
      }
      processNextHandler();
    });
  }

  async ionViewWillEnter(){
    this.isReview = await this.storage.get('isReview');
    let username = await this.storage.get('username');
    if(username){
      this.userName = username;
      this.formGroup.patchValue({userName:this.userName});
      this.isAuthen = true;
      this.getUser();
      this.getlstUser();
      this.getTotalNoti();
    } 
    let loginError = this.rt.snapshot.queryParams["loginError"];
    if (loginError) {
      this.dataLoginError = JSON.parse(loginError);
      this.isOpenLoginError = true;
    }
    const result = await NativeBiometric.isAvailable();
    if (result) {
      switch (result.biometryType) {
        case BiometryType.FINGERPRINT:
        case BiometryType.TOUCH_ID:
          this.faceID = false;
          break;
        case BiometryType.FACE_AUTHENTICATION:
        case BiometryType.FACE_ID:
          this.faceID = true;
          break;
      }
    }
  }

  ionViewWillLeave(){
    this.formGroup.reset();
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Function
  async onSignIn() {
    if (this.formGroup.controls['userName'].invalid) {
      this.notification.showNotiError('', 'Tài khoản không được bỏ trống');
      this.eleUserName.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['passWord'].invalid) {
      this.notification.showNotiError('', 'Mật khẩu không được bỏ trống');
      this.elePassword.nativeElement.focus();
      return;
    }
    if(this.isOpenSigin){
      this.cancelSigin();
    }
    let oData = this.formGroup.getRawValue();
    let userName = oData?.userName;
    let passWord = oData?.passWord;
    let token = await this.storage.get('token');
    const info = await Device.getInfo();
    const infoID = await Device.getId();
    let deviceName = info.manufacturer+' '+info.model;
    let deviceID = infoID.identifier;
    let data = {
      userName:userName,
      passWord:passWord,
      token:token,
      deviceName:deviceName,
      deviceID:deviceID
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
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
  }

  goSignUpPage() {
    this.navCtrl.navigateForward('home/signup');
  }

  changeAuthen(isAuthen:any){
    this.cancelChangeAccount();
    this.isAuthen = isAuthen;
    this.formGroup.patchValue({userName:''});
  }

  openChangeAccount(){
    this.isChangeAccount = true;
    this.formGroup.controls['userName'].enable();
    this.formGroup.patchValue({userName:''});
  }
  
  cancelChangeAccount(){
    this.isChangeAccount = false;
    this.dt.detectChanges();
  }

  async onAuthen(){
    if (!this.userName) {
      this.notification.showNotiError('', 'Vui lòng đăng nhập tài khoản và mật khẩu trước khi sử dụng xác thực!');
      return;
    }
    if(!this.oUser.isBiometrics){
      
      this.notification.showNotiError('', 'Vui lòng đăng nhập vào ứng dụng để thiết lập tính năng đăng nhập bằng sinh trắc học!');
      return;
    }
    const result = await NativeBiometric.isAvailable();
    if (!result.isAvailable) {
      switch(result.errorCode){
        case 0:
          this.notification.showNotiError('', 'Lỗi không xác định!');
          break;
        case 1:
          this.notification.showNotiError('', 'Thiết bị của Quý khách không có loại xác thực bằng sinh trắc học!');
          break;
        case 3:
          switch(result.biometryType){
            case BiometryType.FINGERPRINT:
            case BiometryType.TOUCH_ID:
              this.notification.showNotiError('', 'Vui lòng đăng ký dấu vân tay để sử dụng!');
              break;
            case BiometryType.FACE_AUTHENTICATION:
            case BiometryType.FACE_ID:
              this.notification.showNotiError('', 'Vui lòng đăng ký xác thực khuôn mặt để sử dụng!');
              break;
            default:
              this.notification.showNotiError('', 'Vui lòng đăng ký dấu vân tay/xác thực khuôn mặt để sử dụng!');
              break;
          }
          break;
      }
      return;
    }
    const verified = await NativeBiometric.verifyIdentity({
      reason: "Trakuaidi xin chào! Quý khách chỉ có thể xác thực được 5 lần! Mời Quý khách xác thực",
      title: "Trakuaidi xin chào!",
      //subtitle: "Đăng nhập",
      description: "Quý khách chỉ có thể xác thực được 5 lần! Mời Quý khách xác thực",
      maxAttempts:5,
      negativeButtonText:'Hủy',
      useFallback:true
    })
      .then((res:any) => true)
      .catch((res:any) => {
        if (res && res?.code) {
          switch(res?.code){
            case (BiometricAuthError.AUTHENTICATION_FAILED).toString():
              this.notification.showNotiError('', 'Xác thực không thành công!');
              break;
            case (BiometricAuthError.USER_TEMPORARY_LOCKOUT).toString():
              this.notification.showNotiError('', 'Quý khách đã xác thực không thành công quá 5 lần !Vui lòng thử lại sau 30 giây');
              break;
            // default:
            //   this.notification.showNotiError('', 'Xác thực không thành công!');
            //   break;
          }
        }
      });

    if(!verified) return;
    if(verified){
      let username = await this.storage.get('username');
      let password = await this.storage.get('password');
      let token = await this.storage.get('token');
      const info = await Device.getInfo();
      const infoID = await Device.getId();
      let deviceName = info.manufacturer + ' ' + info.model;
      let deviceID = infoID.identifier;
      let data = {
        userName: username,
        passWord: password,
        token: token,
        deviceName: deviceName,
        deviceID: deviceID
      }
      let messageBody = {
        dataRequest: JSON.stringify(data)
      };
      this.api.execByBody('Authencation', 'login', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res && !res?.isError) {
          this.storage.set('isLogin', true);
          this.navCtrl.navigateForward('main/mainpage', { queryParams: { checklogin: false} });
        } else {
          this.notification.showNotiError('', res?.message);
        }
      })
    }
  }

  async onChangeAccount(item:any){
    this.cancelChangeAccount();
    this.openSigin(item?.username);
    // let username = item?.username;
    // let password = item?.password;
    // let token = await this.storage.get('token');
    // const info = await Device.getInfo();
    // const infoID = await Device.getId();
    // let deviceName = info.manufacturer + ' ' + info.model;
    // let deviceID = infoID.identifier;
    // let data = {
    //   userName: username,
    //   passWord: password,
    //   token: token,
    //   deviceName: deviceName,
    //   deviceID: deviceID
    // }
    // let messageBody = {
    //   dataRequest: JSON.stringify(data)
    // }; 
    // this.api.execByBody('Authencation', 'login', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
    //   if (res && !res?.isError) {
    //     this.storage.set('isLogin', true);
    //     this.storage.set('username', item?.username);
    //     this.storage.set('password', item?.password);
    //     this.navCtrl.navigateForward('main/mainpage', { queryParams: { checklogin: false} });
    //   } else {
    //     this.notification.showNotiError('', res?.message);
    //   }
    // })
  }

  cancelError(){
    this.isOpenLoginError = false;
    this.dt.detectChanges();
  }

  async getUser(){
    let username = await this.storage.get('username');
    let data = {
      userName:username,
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'getuser', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
        this.notification.showNotiError('', res[1].message);
      }else{
        this.oUser = res[1];
      }
    })
  }
  
  async getlstUser(){
    let lstUser = await this.storage.get('lstUser');
    let data = {
      lstUser:lstUser,
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'getlistuser', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
      }else{
        this.listUser = res[1];
        // let index = this.listUser.findIndex((x:any) => x.username == this.userName)
        // if (index > -1) {
        //   this.oUser = this.listUser[index];
        // }
      }
    })
  }

  async getTotalNoti(){
    let username = await this.storage.get('username');
    let data = {
      userName: username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'gettotalnotification', messageBody).subscribe(async (res:any)=>{
      if (res[0]) {
      } else {
        this.totalNoti = res[1];
        await Badge.set({ count:this.totalNoti });
        this.dt.detectChanges();
      }
    })
  }

  goNoti(){
    this.navCtrl.navigateForward('home/notification');
  }

  openDeleteAccount(item:any){
    this.accountSelected = {...item};
    this.isOpenDeleteAccount = true;
  }

  cancelDeleteAccount(){
    this.isOpenDeleteAccount = false;
    this.dt.detectChanges();
  }

  async deleteAccountSession(item:any){
    this.cancelDeleteAccount();
    this.cancelChangeAccount();
    let lstUser = await this.storage.get('lstUser');
    let array = lstUser.split(';');
    let index = array.findIndex((x:any) => x == item.username);
    if (index > -1) {
      array.splice(index, 1);
      if (array.length == 1) {
        let value = array[0];
        lstUser = value;
      }else if(array.length == 0){
        lstUser = "";
      }else{
        lstUser = array.join(';');
      }
      this.storage.set('lstUser', lstUser);
    }
    let index2 = this.listUser.findIndex((x:any) => x.username == item.username);
    if (index2 > -1) {
      this.listUser.splice(index2, 1);
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

  openSigin(userName:any){
    this.formGroup.patchValue({userName:userName});
    this.formGroup.controls['userName'].disable();
    this.isOpenSigin = true;
  }

  cancelSigin(){
    this.isOpenSigin = false;
    this.dt.detectChanges();
  }

  goForgotPassword(){
    this.navCtrl.navigateForward('home/forgotpassword');
  }
  //#endregion
}
