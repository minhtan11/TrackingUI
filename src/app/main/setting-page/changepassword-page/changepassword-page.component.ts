import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
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

  onback(){
    this.navCtrl.navigateBack('main');
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
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation','changepassword',this.formGroup.value).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res && !res?.isError) {
            this.notification.showNotiSuccess('', res.message);
            this.navCtrl.navigateForward('main',{queryParams:{selected:3}});
          }else{
            this.notification.showNotiError('',res?.message);
          }
        },
        complete:()=>{
          this.api.isLoad(false);
        }
      })
    }, 1000);
    
  }

}
