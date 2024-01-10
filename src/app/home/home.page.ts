import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { NotificationServiceComponent } from '../notification-service/notification-service.component';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from '../apiservice/apiservice.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit,AfterViewInit {
  //#region Contrucstor
  @ViewChild('eleUserName') eleUserName: any;
  @ViewChild('elePassword') elePassword: any;
  showPass:any = false;
  isHideFooter:any=false;
  isError:any = false;
  messageError:any;
  formGroup!: FormGroup;
  private destroy$ = new Subject<void>();
  constructor(
    private router: Router,
    private dt : ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private notification : NotificationServiceComponent,
    private api : ApiserviceComponent,
  ) {}
  //#endregion

  //#region Init
  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      userName: ['', Validators.required],
      passWord: ['', Validators.required]
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

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Function
  onSignIn(){
    if (this.formGroup.controls['userName'].invalid) {
      this.notification.showNotiError('','Tài khoản không được bỏ trống');
      this.eleUserName.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['passWord'].invalid) {
      this.notification.showNotiError('','Mật khẩu không được bỏ trống');
      this.elePassword.nativeElement.focus();
      return;
    }
    let queryParams = new HttpParams();
    queryParams = queryParams.append("userName",this.formGroup.value?.userName);
    queryParams = queryParams.append("passWord",this.formGroup.value?.passWord);
    this.api.execByParameter('Authencation','login',queryParams,true).subscribe((res:any)=>{
      if (res && !res?.isError) {
        this.router.navigate(['main/home'],{queryParams: {oUser:JSON.stringify(res.data)}});
        this.notification.showNotiSuccess('','Đăng nhập thành công');
      }else{
        this.notification.showNotiError('',res?.message);
      }
    })
  }

  goSignUpPage(){
    
    this.router.navigate(['home/signup']);
  }

  //#endregion
}
