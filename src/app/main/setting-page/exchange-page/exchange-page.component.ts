import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-exchange-page',
  templateUrl: './exchange-page.component.html',
  styleUrls: ['./exchange-page.component.scss'],
})
export class ExchangePageComponent  implements OnInit {
  @ViewChild('eleAmount') eleAmount: any;
  isHideFooter:any=false;
  formGroup!: FormGroup;
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
  ) { 
  }

  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      wallet: [{ value: '', disabled: true },Validators.required],
      amount: new FormControl("", [Validators.required,Validators.max(9999), Validators.min(1)]),
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
      if((this.router.url.includes('main/setting/exchange'))){
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
    this.getUser();
  }

  onback(){
    this.navCtrl.navigateBack(this.previousUrl);
  }

  async onExchange(){
    if (this.formGroup.controls['amount'].invalid) {
      if ((this.formGroup.controls['amount'] as any).errors.required) {
        this.notification.showNotiError('', 'Số lượt không được bỏ trống!');
        return;
      }
      if ((this.formGroup.controls['amount'] as any).errors.min) {
        this.notification.showNotiError('', 'Số lượt không được nhỏ hơn 1!');
        return;
      }
      if ((this.formGroup.controls['amount'] as any).errors.max) {
        this.notification.showNotiError('', 'Số lượt quá lớn!');
        return;
      }
      return;
    }
    let username = await this.storage.get('username');
    let data = {
      userName:username,
      amount:this.formGroup.value.amount
    }
    let messageBody = {
      dataRequest:JSON.stringify(data)
    };
    this.api.execByBody('Authencation','exchange',messageBody,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res && !res?.isError) {
        this.notification.showNotiSuccess('', res.message);
        this.navCtrl.navigateBack(this.previousUrl);
      }else{
        this.notification.showNotiError('',res?.message);
      }
    })
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
        this.formGroup.patchValue({wallet:res[1]?.wallet});
      }
    })
  }
}
