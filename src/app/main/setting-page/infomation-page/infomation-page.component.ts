import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import { Keyboard } from '@capacitor/keyboard';
import { Camera, CameraResultType } from '@capacitor/camera';

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
      gender: [true, Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      username: new FormControl({ value: '', disabled: true }),
      base64String: [''],
      fileName: ['']
    });
    let data = JSON.parse(this.rt.snapshot.queryParams['oUser']);
    this.formGroup.patchValue(data);
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

  onUpdate(){
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
  
  async uploadImage(){
    this.image = await Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.Base64,
    });
    this.dt.detectChanges();
  }

  onback(){
    this.navCtrl.navigateBack('main/setting');
  }

}
