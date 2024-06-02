import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-changepassword-page',
  templateUrl: './changepassword-page.component.html',
  styleUrls: ['./changepassword-page.component.scss'],
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
  previousUrl:any;
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
      
    });
    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
      
    });
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('main/setting/changepassword'))){
        this.onback();
        return;
      }
      processNextHandler();
    })
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

  onback(){
    this.navCtrl.navigateBack(this.previousUrl);
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
      if (res && !res?.isError) {
        this.notification.showNotiSuccess('', res.message);
        this.navCtrl.navigateBack(this.previousUrl);
      }else{
        this.notification.showNotiError('',res?.message);
      }
    })
  }
}
