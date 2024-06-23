import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IonContent, IonRouterOutlet, NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';
import { Device } from '@capacitor/device';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PushNotificationSchema, PushNotifications } from '@capacitor/push-notifications';

@Component({
  selector: 'app-setting-page',
  templateUrl: './setting-page.component.html',
  styleUrls: ['./setting-page.component.scss'],
})
export class SettingPageComponent {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('eleUserName') eleUserName: any;
  @ViewChild('elePassword') elePassword: any;
  oUser:any;
  isReview:any;
  titleTime:any = '';
  isOpenLogout:any = false;
  isOpenDelete:any = false;
  isOpenSupport:any=false;
  isOpenChangeAccount:any=false;
  isOpenAddAccount:any=false;
  isOpenDeleteAccount:any=false;
  isOpenRule:any=false;
  listUser:any;
  userName:any;
  accountSelected:any;
  formGroup!: FormGroup;
  showPass: any = false;
  private destroy$ = new Subject<void>();
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private routerOutlet: IonRouterOutlet,
    private previous:PreviousRouterServiceService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) { 
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {        
        if (event && event.urlAfterRedirects.includes('/main/setting')) {
          this.getTime();
          this.getUser();
        }
      };
    });
  }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
    this.formGroup = this.formBuilder.group({
      userName: ['', Validators.required],
      passWord: ['', Validators.required]
    });
  }

  async ngAfterViewInit() {
    await PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        let array = this.router.url.split('?');
        let url = array[0];
        if ((url.includes('main/setting'))) {
          this.getUser();
        }
      }
    );
    // Network.addListener('networkStatusChange', status => {
    //   this.isconnected = status.connected;
    //   if (status.connected && status.connectionType != 'none') {
    //     this.isloadpage = true;
    //     
    //     setTimeout(() => {
    //       this.loadData();
    //     }, 500);
    //   }
    //   if (!status.connected && status.connectionType == 'none') {
    //     this.lstData = [];
    //     this.isload = true;
    //     this.pageNum = 1;
    //     this.isEmpty = false;
    //     
    //   }
    // });
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    this.isReview = await this.storage.get('isReview');
    let username = await this.storage.get('username');
    if(username) this.userName = username;
    this.getlstUser();
  }

  ionViewDidEnter() {
    
  }

  ionViewWillLeave(){
    this.onDestroy();
  }

  getTime(){
    let today = new Date()
    let curHr = today.getHours()
    let time = null;

    if (curHr < 12) {
      this.titleTime = "Chào buổi sáng";
    } else if (curHr < 18) {
      this.titleTime = "Chào buổi chiều";
    } else {
      this.titleTime = "Chào buổi tối";
    }
    
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
      }
      this.dt.detectChanges();
    })
  }

  async getlstUser(){
    let username = await this.storage.get('username');
    if(username) this.userName = username;
    let lstUser = await this.storage.get('lstUser');
    let data = {
      lstUser:lstUser,
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'getlistuser', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res[0]) {
      }else{
        this.listUser = res[1];
      }
    })
  }

  goInformation(){
    this.navCtrl.navigateForward('main/setting/information');
  }

  goWithdraw(type:any){
    this.navCtrl.navigateForward('main/setting/withdraw',{queryParams:{type:type}});
  }

  goChangePassword(){
    this.navCtrl.navigateForward('main/setting/changepassword');
  }

  goReport(){
    this.navCtrl.navigateForward('main/setting/report');
  }

  async goFAQ(){
    let url = await this.storage.get('urlFAQ');
    if (url) {
      window.open(url);
    }
    // window.open("http://zalo.me/1977119545826967396?src=qr")
    //this.navCtrl.navigateForward('main/setting/faq');
  }

  goExchange(){
    this.navCtrl.navigateForward('main/setting/exchange');
  }

  //#region Logout
  onOpenLogout(){
    this.isOpenLogout = true;
  }

  cancelLogout(){
    this.isOpenLogout = false;
    
  }

  onLogout(){
    this.cancelLogout();
    let data = {
      userName: this.oUser?.username,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'logoutaccount', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.isError) {
        this.storage.remove('isLogin');
        this.navCtrl.navigateBack('home');
      } else {
        this.notification.showNotiError('', res?.message);
      }
    })
  }
  //#endregion

  //#region delete account
  onOpenDelete(){
    this.isOpenDelete = true;
  }

  cancelDelete(){
    this.isOpenDelete = false;
    this.dt.detectChanges();
  }

  onDelete() {
    this.cancelDelete();
    let data = {
      userName: this.oUser?.username,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'deleteaccount', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.isError) {
        this.notification.showNotiSuccess('', res?.message);
        this.storage.remove('username');
        this.storage.remove('password');
        this.navCtrl.navigateBack('home');
      } else {
        this.notification.showNotiError('', res?.message);
      }
    })
  }
  //#endregion

  //#region support
  onOpenSupport(){
    this.isOpenSupport = true;
  }

  cancelSupport(){
    this.isOpenSupport = false;
    this.dt.detectChanges();
  }

  goZalo(){
    this.cancelSupport();
    window.open("http://zalo.me/1977119545826967396?src=qr")
  }

  goPhone(){
    this.cancelSupport();
    window.open("tel:+84816611688");
  }
  //#endregion

  //#region ChangeAccount
  onOpenChangeAccount(){
    this.isOpenChangeAccount = true;
  }
  
  cancelChangeAccount(){
    this.isOpenChangeAccount = false;
    this.dt.detectChanges();
  }

  async onChangeAccount(item:any){
    let username = item?.username;
    let password = item?.password;
    let token = await this.storage.get('token');
    const info = await Device.getInfo();
    const infoID = await Device.getId();
    let deviceName = info.manufacturer+' '+info.model;
    let deviceID = infoID.identifier;
    let data = {
      userName:username,
      passWord:password,
      token:token,
      deviceName:deviceName,
      deviceID:deviceID,
      currUsername:this.userName
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'changeaccount', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.isError) {
        this.storage.set('username', username);
        this.storage.set('password', password);
        this.userName = item?.username;
        this.cancelChangeAccount();
        setTimeout(() => {
          this.content.scrollToTop();
          this.getUser();
          this.getlstUser();
          this.api.callBackPackage(true);
          this.api.callBackNoti(true);
          this.api.callBackOrder(true);
        }, 500);
        
      } else {
        this.notification.showNotiError('', res?.message);
      }
    })
  }

  onOpenAddAccount(){
    this.cancelChangeAccount();
    this.isOpenAddAccount = true;
    this.formGroup.patchValue({userName:''});
  }

  cancelAddAccount(){
    this.isOpenAddAccount = false;
    this.formGroup.reset();
    this.dt.detectChanges();
  }

  async onSignIn(){
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
    let oData = this.formGroup.getRawValue();
    let userName = oData?.userName;
    let passWord = oData?.passWord;
    let token = await this.storage.get('token');
    const info = await Device.getInfo();
    const infoID = await Device.getId();
    let deviceName = info.manufacturer+' '+info.model;
    let deviceID = infoID.identifier;
    let data = {
      userName:userName,
      passWord:passWord,
      token:token,
      deviceName:deviceName,
      deviceID:deviceID,
      currUsername:this.userName
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'changeaccount', messageBody,true).pipe(takeUntil(this.destroy$)).subscribe(async (res: any) => {
      if (res && !res?.isError) {
        this.storage.set('username', userName);
        this.storage.set('password', passWord);
        this.userName = userName;
        await this.storage.setAccount(userName);
        this.formGroup.reset();
        this.cancelAddAccount();
        setTimeout(() => {
          this.content.scrollToTop();
          this.getUser();
          this.getlstUser();
          this.api.callBackPackage(true);
          this.api.callBackNoti(true);
          this.api.callBackOrder(true);
        }, 500);
      } else {
        this.notification.showNotiError('', res?.message);
      }
    })
  }

  openDeleteAccount(item:any){
    this.accountSelected = {...item};
    this.isOpenDeleteAccount = true;
  }

  cancelDeleteAccount(){
    this.isOpenDeleteAccount = false;
    this.dt.detectChanges();
  }

  async deleteAccountSession(item:any){
    this.cancelDeleteAccount();
    this.cancelChangeAccount();
    let lstUser = await this.storage.get('lstUser');
    let array = lstUser.split(';');
    let index = array.findIndex((x:any) => x == item.username);
    if (index > -1) {
      array.splice(index, 1);
      if (array.length == 1) {
        let value = array[0];
        lstUser = value;
      }else if(array.length == 0){
        lstUser = "";
      }else{
        lstUser = array.join(';');
      }
      this.storage.set('lstUser', lstUser);
    }
    let index2 = this.listUser.findIndex((x:any) => x.username == item.username);
    if (index2 > -1) {
      this.listUser.splice(index2, 1);
    }
  }
  //#endregion

  //#region Rule
  openRule(){
    this.isOpenRule = true;
  }

  cancelRule(){
    this.isOpenRule = false;
    this.dt.detectChanges();
  }
  //#endregion

  //#region ChangeBiometrics
  changeBiometrics(event:any){
    let data = {
      userName:this.oUser?.username,
      check:event
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation', 'updatebiometrics', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.isError) {
        this.oUser.isBiometrics = event;
      } else {
        this.notification.showNotiError('', res?.message);
      }
    })
  }
  //#endregion
}
