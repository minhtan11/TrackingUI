import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { NotificationServiceComponent } from '../notification-service/notification-service.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from '../apiservice/apiservice.component';
import { StorageService } from '../storage-service/storage.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { environment } from 'src/environments/environment';
import { BiometricAuthError, BiometryType, NativeBiometric } from "capacitor-native-biometric";


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    private http: HttpClient,
    
  ) {
  }
  //#endregion

  //#region Init
  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      userName: ['', Validators.required],
      passWord: ['', Validators.required]
    });
    // let username = await this.storage.get('username');
    
    // if(username){
    //   this.userName = username;
    //   this.formGroup.patchValue({userName:this.userName});
    //   this.isAuthen = true;
    //   this.dt.detectChanges();
    // } 
  }

  async ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
      this.dt.detectChanges();
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
      this.dt.detectChanges();
    });
  }

  async ionViewWillEnter(){
    let username = await this.storage.get('username');
    if(username){
      this.userName = username;
      this.formGroup.patchValue({userName:this.userName});
      this.isAuthen = true;
      this.dt.detectChanges();
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

    let data = {
      userName:this.formGroup.value?.userName,
      passWord:this.formGroup.value?.passWord
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'login', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res && !res?.isError) {
            this.storage.set('username', this.formGroup.value.userName);
            this.storage.set('isLogin', true);
            this.navCtrl.navigateForward('main/home');
          } else {
            this.notification.showNotiError('', res?.message);
          }
        },
        complete : ()=>{
          this.api.isLoad(false);
        }
      })
    }, 1000);
  }

  goSignUpPage() {
    this.navCtrl.navigateForward('home/signup');
  }

  changeAuthen(isAuthen:any){
    this.isAuthen = isAuthen;
    this.dt.detectChanges();
  }

  async onAuthen(){
    if (!this.userName) {
      this.notification.showNotiError('', 'Vui lòng đăng nhập tài khoản và mật khẩu trước khi sử dụng xác thực!');
      return;
    }
    const result = await NativeBiometric.isAvailable();
    if (!result.isAvailable) {
      switch(result.errorCode){
        case 0:
          this.notification.showNotiError('', 'Lỗi không xác định!');
          break;
        case 1:
          this.notification.showNotiError('', 'Thiết bị của bạn không có loại xác thực bằng sinh trắc học!');
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
      reason: "Trakuaidi xin chào! Bạn chỉ có thể xác thực được 5 lần! Mời bạn xác thực",
      title: "Trakuaidi xin chào!",
      //subtitle: "Đăng nhập",
      description: "Bạn chỉ có thể xác thực được 5 lần! Mời bạn xác thực",
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
              this.notification.showNotiError('', 'BanVui lòng thử lại sau 30 giây!');
              break;
            // default:
            //   this.notification.showNotiError('', 'Xác thực không thành công!');
            //   break;
          }
        }
      });

    if(!verified) return;
    if(verified){
      let data = {
        userName: this.userName,
      }
      let messageBody = {
        dataRequest: JSON.stringify(data)
      };
      this.api.isLoad(true);
      setTimeout(() => {
        this.api.execByBody('Authencation', 'getuser', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
          next:(res: any) => {
            if (res[0]) {
              this.notification.showNotiError('', res[1].message);
            } else {
              this.storage.set('isLogin', true);
              this.navCtrl.navigateForward('main/home');
            }
          },
          complete:()=> {
            this.api.isLoad(false);
          },
        })
      }, 1000);
    }
  }

  //#endregion
}
