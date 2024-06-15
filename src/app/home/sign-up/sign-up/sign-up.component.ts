import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { Subject, takeUntil } from 'rxjs';
import { StorageService } from 'src/app/storage-service/storage.service';
import { Device } from '@capacitor/device';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';

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
  isOpen:any = false;
  previousUrl:any;
  private destroy$ = new Subject<void>();
  constructor(
    private dt : ChangeDetectorRef,
    private navCtrl: NavController,
    private router: Router,
    private formBuilder: FormBuilder,
    private notification: NotificationServiceComponent,
    private api: ApiserviceComponent,
    private storage: StorageService,
    private previous:PreviousRouterServiceService,
    private platform : Platform,
  ) { }
  //#endregion

  //#region Init
  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      fullName: ['', Validators.required],
      gender: [Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      base64String : [''],
      fileName:[''],
      tokenDevice:[''],
      deviceName:[''],
      deviceID:[''],
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
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('home/signup'))){
        this.onback();
        return;
      }
      processNextHandler();
    })
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillEnter(){
    if (!this.previousUrl) {
      let url = this.previous.getPreviousUrl();
      if (url) {
        let array = url.split('?');
        this.previousUrl = array[0];
      }
    } 
  }
  
  ionViewWillLeave(){
    this.onDestroy();
  }
  //#endregion

  //#region Function
  showPassword(){
    this.showPass = !this.showPass;
  }

  async onSignUp(){
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
    if (this.image) {
      let fileName = Date.now() + this.formGroup.value.username + '.' + this.image?.format;
      this.formGroup.patchValue({ base64String: this.image?.base64String });
      this.formGroup.patchValue({ fileName: fileName });
    }
    
    let token = await this.storage.get('token');
    const info = await Device.getInfo();
    const infoID = await Device.getId();
    let deviceName = info.manufacturer+' '+info.model;
    let deviceID = infoID.identifier;
    this.formGroup.patchValue({ deviceName: deviceName });
    this.formGroup.patchValue({ deviceID: deviceID });
    if (token) {
      this.formGroup.patchValue({ tokenDevice: token });
    }
    this.api.execByBody('Authencation','register',this.formGroup.value,true).pipe(takeUntil(this.destroy$)).subscribe(async (res:any)=>{
      if (res && !res?.isError) {
        this.storage.set('username', this.formGroup.value.username.trim());
        this.storage.set('password', this.formGroup.value.password.trim());
        this.storage.set('isLogin', true);
        await this.storage.setAccount(this.formGroup.value.username);
        this.navCtrl.navigateForward('main/mainpage', { queryParams: { checklogin: false} });
      }else{
        this.notification.showNotiError('',res?.message);
      }
    })
  }

  async uploadImage(type:any){
    this.onDismiss();
    switch(type){
      case '1':
        this.image = await Camera.getPhoto({
          quality: 100,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          saveToGallery:true,
          source : CameraSource.Camera
        });
        this.dt.detectChanges();
        break;
      case '2':
        this.image = await Camera.getPhoto({
          quality: 100,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          saveToGallery:false,
          source : CameraSource.Photos
        });
        this.dt.detectChanges();
        break;
    }
  }

  onback(){
    this.navCtrl.navigateBack(this.previousUrl);
  }

  onOpen(){
    this.isOpen = true;
    this.dt.detectChanges();
  }

  onDismiss(){
    this.isOpen = false;
    this.dt.detectChanges();
  }

  onfocus(ele:any){
    if (ele) {
      ele.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }
  //#endregion

}
