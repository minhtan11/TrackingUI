import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import { Keyboard } from '@capacitor/keyboard';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';

@Component({
  selector: 'app-infomation-page',
  templateUrl: './infomation-page.component.html',
  styleUrls: ['./infomation-page.component.scss'],
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
  imgUser:any = '';
  oUser:any;
  previousUrl:any;
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
    private previous:PreviousRouterServiceService,
    private platform : Platform,
    private router:Router,
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

  async ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
      
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
      
    });
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('main/setting/information'))){
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

  async ionViewWillEnter(){
    this.getUser();
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
      this.api.execByBody('Authencation','updateaccount',data,true).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res && !res?.isError) {
            this.notification.showNotiSuccess('',res?.message);
            this.navCtrl.navigateBack(this.previousUrl);
          }else{
            this.notification.showNotiError('',res?.message);
          }
        },complete : ()=>{
          this.api.isLoad(false);
        }
      })
    }, 1000);
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
        
        break;
      case '2':
        this.image = await Camera.getPhoto({
          quality: 100,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          saveToGallery:false,
          source : CameraSource.Photos
        });
        
        break;
    }
    this.isChooseImg = true;
    
  }

  onOpen(){
    this.isOpen = true;
  }

  onDismiss(){
    this.isOpen = false;
    this.dt.detectChanges();
  }

  onback(){
    this.navCtrl.navigateBack(this.previousUrl);
  }

  onfocus(ele:any){
    if (ele) {
      ele.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }
}
