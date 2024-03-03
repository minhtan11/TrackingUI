import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { NotificationServiceComponent } from '../notification-service/notification-service.component';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from '../apiservice/apiservice.component';
import { StorageService } from '../storage-service/storage.service';
import { SplashScreen } from '@capacitor/splash-screen';


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
    
  ) {
  }
  //#endregion

  //#region Init
  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      userName: ['', Validators.required],
      passWord: ['', Validators.required]
    });
    let username = await this.storage.get('username');
    if(username) this.formGroup.patchValue({userName:username});
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
    if(username) this.formGroup.patchValue({userName:username});
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
    let queryParams = new HttpParams();
    queryParams = queryParams.append("userName", this.formGroup.value?.userName);
    queryParams = queryParams.append("passWord", this.formGroup.value?.passWord);
    this.api.execByParameter('Authencation', 'login', queryParams,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.isError) {
        this.navCtrl.navigateForward('main');
        this.storage.set('username', this.formGroup.value.userName);
        this.storage.set('password', this.formGroup.value.passWord);
      } else {
        this.notification.showNotiError('', res?.message);
      }
    })
  }

  goSignUpPage() {
    this.navCtrl.navigateForward('home/signup');
  }

  //#endregion
}
