import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent  implements OnInit {
  //#region Contrucstor
  @ViewChild('eleEmail') eleEmail: any;
  isHideFooter:any=false;
  formGroup!: FormGroup;
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
  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      email: ['', Validators.required],
      userName:[''],
    });
    let username = await this.storage.get('username');
    this.formGroup.patchValue({userName:username});
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
      if((this.router.url.includes('home/forgotpassword'))){
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

  onback(){
    this.navCtrl.navigateBack(this.previousUrl);
  }

  onForgot(){
    if (this.formGroup.controls['email'].invalid) {
      this.notification.showNotiError('', 'Email không được bỏ trống');
      this.eleEmail.nativeElement.focus();
      return;
    }
    let oData = this.formGroup.getRawValue();
    let email = oData?.email;
    let userName = oData?.userName;
    let data = {
      email:email,
      userName:userName
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'forgotpassword', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe(async (res:any)=>{
      if (res && !res?.isError) {
        this.navCtrl.navigateForward('home/resetpassword');
      } else {
        this.notification.showNotiError('', res?.message);
      }
    })
  }

  onfocus(ele:any){
    if (ele) {
      ele.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }
  //#endregion

}
