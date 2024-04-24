import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import { Keyboard } from '@capacitor/keyboard';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-infomation-page',
  templateUrl: './infomation-page.component.html',
  styleUrls: ['./infomation-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfomationPageComponent  implements OnInit {
  @ViewChild('eleFullName') eleFullName: any;
  @ViewChild('eleGender') eleGender: any;
  @ViewChild('elePhone') elePhone: any;
  @ViewChild('eleEmail') eleEmail: any;
  @ViewChild('eleAddress') eleAddress: any;
  isHideFooter:any=false;
  formGroup!: FormGroup;
  image:any;
  isOpen:any = false;
  isDismiss:any=false;
  imgUser:any = '';
  oUser:any;
  isChooseImg:any = false;
  private destroy$ = new Subject<void>();
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private formBuilder: FormBuilder,
  ) { 
  }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      fullName: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      username: new FormControl({ value: '', disabled: true }),
      base64String: [''],
      fileName: [''],
      img:['']
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

  async ionViewWillEnter(){
    this.getUser();
  }
  
  ionViewWillLeave(){
    this.onDestroy();
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
        this.formGroup.patchValue(this.oUser);
        this.dt.detectChanges();
      }
    })
  }
  

  async onUpdate(){
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
    if (this.image) {
      let fileName = Date.now() + this.formGroup.value.username + '.' + this.image?.format;
      this.formGroup.patchValue({ base64String: this.image?.base64String });
      this.formGroup.patchValue({ fileName: fileName });
    }
    let username = await this.storage.get('username');
    let data = this.formGroup.value;
    data.username = username;
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation','updateaccount',data).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res && !res?.isError) {
            this.notification.showNotiSuccess('',res?.message);
            this.navCtrl.navigateForward('main/mainpage',{queryParams:{selected:0}});
          }else{
            this.notification.showNotiError('',res?.message);
          }
        },complete : ()=>{
          this.api.isLoad(false);
        }
      })
    }, 1000);
    // this.api.execByBody('Authencation','register',this.formGroup.value,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
    //   if (res && !res?.isError) {
    //     this.storage.set('username', this.formGroup.value.username);
    //     this.storage.set('password', this.formGroup.value.password);
    //     this.navCtrl.navigateForward('main');
    //     this.notification.showNotiSuccess('', 'Tạo tài khoản thành công!');
    //     this.dt.detectChanges();
    //   }else{
    //     this.notification.showNotiError('',res?.message);
    //     this.dt.detectChanges();
    //   }
    // })
    
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
    this.isChooseImg = true;
    this.dt.detectChanges();
  }

  onOpen(){
    this.isOpen = true;
    this.isDismiss = false;
    this.dt.detectChanges();
  }

  onDismiss(){
    this.isDismiss = true;
    this.isOpen = false;
    this.dt.detectChanges();
  }

  onback(){
    this.navCtrl.navigateBack('main/setting');
  }

}
