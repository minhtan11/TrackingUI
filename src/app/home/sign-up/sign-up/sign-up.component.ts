import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { Subject, takeUntil } from 'rxjs';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent  implements OnInit,AfterViewInit {
  //#region Contrucstor
  @ViewChild('eleFullName') eleFullName: any;
  @ViewChild('eleGender') eleGender: any;
  @ViewChild('elePhone') elePhone: any;
  @ViewChild('eleEmail') eleEmail: any;
  @ViewChild('eleAddress') eleAddress: any;
  @ViewChild('eleUserName') eleUserName: any;
  @ViewChild('elePassword') elePassword: any;
  showPass:any = false;
  isHideFooter:any=false;
  formGroup!: FormGroup;
  image:any;
  private destroy$ = new Subject<void>();
  constructor(
    private dt : ChangeDetectorRef,
    private navCtrl: NavController,
    private router: Router,
    private formBuilder: FormBuilder,
    private notification: NotificationServiceComponent,
    private api: ApiserviceComponent,
    private storage: StorageService,
  ) { }
  //#endregion

  //#region Init
  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      fullName: ['', Validators.required],
      gender: [true, Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      base64String : [''],
      fileName:['']
    });
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

  ngOnDestroy(): void {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  ionViewWillLeave(){
    this.onDestroy();
  }
  //#endregion

  //#region Function
  showPassword(){
    this.showPass = !this.showPass;
  }

  onSignUp(){
    if (this.image) {
      let fileName = Date.now() + this.formGroup.value.username + '.' + this.image?.format;
      this.formGroup.patchValue({ base64String: this.image?.base64String });
      this.formGroup.patchValue({ fileName: fileName });
    }
    if (this.formGroup.controls['fullName'].invalid) {
      this.notification.showNotiError('', 'Họ & tên không được bỏ trống');
      this.eleFullName.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['gender'].invalid) {
      this.notification.showNotiError('', 'Giới tính không được bỏ trống');
      this.eleGender.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['phone'].invalid) {
      this.notification.showNotiError('', 'Số điện thoại không được bỏ trống');
      this.elePhone.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['email'].invalid) {
      this.notification.showNotiError('', 'Email không được bỏ trống');
      this.eleEmail.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['address'].invalid) {
      this.notification.showNotiError('', 'Địa chỉ không được bỏ trống');
      this.eleAddress.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['username'].invalid) {
      this.notification.showNotiError('', 'Tên tài khoản không được bỏ trống');
      this.eleUserName.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['password'].invalid) {
      this.notification.showNotiError('', 'Mật khẩu không được bỏ trống');
      this.elePassword.nativeElement.focus();
      return;
    }
    this.api.execByBody('Authencation','register',this.formGroup.value,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res && !res?.isError) {
        this.storage.set('username', this.formGroup.value.username);
        this.storage.set('password', this.formGroup.value.password);
        this.navCtrl.navigateForward('main');
        this.notification.showNotiSuccess('', 'Tạo tài khoản thành công!');
        this.dt.detectChanges();
      }else{
        this.notification.showNotiError('',res?.message);
        this.dt.detectChanges();
      }
    })
    
  }

  goSignInPage(){
    this.router.navigate(['home']);
  }

  async uploadImage(){
    this.image = await Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.Base64,
    });
    this.dt.detectChanges();
  }
  //#endregion

}
