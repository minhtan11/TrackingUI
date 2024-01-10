import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { NotificationServiceComponent } from '../notification-service/notification-service.component';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from '../apiservice/apiservice.component';
import { StorageService } from '../storage-service/storage.service';
import { Storage } from '@ionic/storage-angular';


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
  isLoad:any = false;
  private destroy$ = new Subject<void>();
  constructor(
    private router: Router,
    private dt: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private notification: NotificationServiceComponent,
    private api: ApiserviceComponent,
    private storage: StorageService,
    private rt: ActivatedRoute,
  ) {
    this.rt.queryParams.subscribe((params: any) => {
      if (Object.keys(params).length != 0) {
      }
    })
  }
  //#endregion

  //#region Init
  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      userName: ['', Validators.required],
      passWord: ['', Validators.required]
    });
    //await this.storage.create();
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
    this.checkLogin();
  }

  ngOnDestroy(): void {
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
    this.api.execByParameter('Authencation', 'login', queryParams, true).subscribe(async (res: any) => {
      if (res && !res?.isError) {
        await this.storage.set('userName', this.formGroup.value.userName);
        await this.storage.set('passWord', this.formGroup.value.passWord);
        setTimeout(() => {
          this.router.navigate(['main/home'], { queryParams: { oUser: JSON.stringify(res.data) } });
        }, 100);
      } else {
        this.notification.showNotiError('', res?.message);
      }
    })
  }

  goSignUpPage() {
    this.router.navigate(['home/signup']);
  }

  async checkLogin() {
    if (this.isLogin) {
      let userName = await this.storage.get('userName');
      let passWord = await this.storage.get('passWord');
      if (userName && passWord) {
        let queryParams = new HttpParams();
        queryParams = queryParams.append("userName", userName);
        queryParams = queryParams.append("passWord", passWord);
        this.api.execByParameter('Authencation', 'login', queryParams, true).subscribe((res: any) => {
          if (res && !res?.isError) {
            this.router.navigate(['main/home'], { queryParams: { oUser: JSON.stringify(res.data) } });
          }else{
            this.isLoad = true;
          }
        })
      }else{
        this.formGroup.patchValue({userName:userName,passWord : passWord})
        this.isLoad = true;
        this.dt.detectChanges();
      }
    }else{

    }
  }

  //#endregion
}
