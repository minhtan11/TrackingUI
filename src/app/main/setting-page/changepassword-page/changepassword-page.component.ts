import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-changepassword-page',
  templateUrl: './changepassword-page.component.html',
  styleUrls: ['./changepassword-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangepasswordPageComponent  implements OnInit {
  @ViewChild('eleOldPassword') eleOldPassword: any;
  @ViewChild('eleNewPassword') eleNewPassword: any;
  @ViewChild('eleConfirmPassword') eleConfirmPassword: any;
  isHideFooter:any=false;
  formGroup!: FormGroup;
  showPass1:any=false;
  showPass2:any=false;
  showPass3:any=false;
  private destroy$ = new Subject<void>();
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private formBuilder: FormBuilder,
  ) { }

  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      userName:[''],
    });
    let username = await this.storage.get('username');
    this.formGroup.patchValue({userName:username});
  }

  onback(){
    this.navCtrl.navigateBack('main/setting');
  }

  onChange(){
    if (this.formGroup.controls['oldPassword'].invalid) {
      this.notification.showNotiError('', 'Mật khẩu không được bỏ trống!');
      this.eleOldPassword.nativeElement.focus();
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
    this.api.execByBody('Authencation','changepassword',this.formGroup.value,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      console.log(res)
      if (res && !res?.isError) {
        this.notification.showNotiSuccess('', res.message);
        this.storage.remove('password');
        this.storage.set('password', this.formGroup.value.newPassword);
        this.navCtrl.navigateBack('main/setting');
        this.dt.detectChanges();
      }else{
        this.notification.showNotiError('',res?.message);
        this.dt.detectChanges();
      }
    })
  }

}
