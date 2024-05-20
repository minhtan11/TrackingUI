import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-withdraw-page',
  templateUrl: './withdraw-page.component.html',
  styleUrls: ['./withdraw-page.component.scss'],
})
export class WithdrawPageComponent  implements OnInit {
  @ViewChild('elepaymentMethod') elepaymentMethod: any;
  @ViewChild('eleBankName') eleBankName: any;
  @ViewChild('eleAccountNumber') eleAccountNumber: any;
  @ViewChild('eleAccountName') eleAccountName: any;
  @ViewChild('eleAmount') eleAmount: any;
  @ViewChild('eleNote') eleNote: any;
  @ViewChild(IonContent) content: IonContent;
  type:any;
  isHideFooter:any=false;
  formGroup!: FormGroup;
  private destroy$ = new Subject<void>();
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private formBuilder: FormBuilder,
  ) { 
    this.type = this.rt.snapshot.queryParams['type'];
  }

  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      paymentMethod: ['',Validators.required],
      bankName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      accountName: ['', Validators.required],
      amount: ['',Validators.required],
      note: ['', Validators.required],
      username:[''],
      type:[this.type]
    });
    let username = await this.storage.get('username');
    this.formGroup.patchValue({username:username});
  }

  async ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
      setTimeout(() => {
        this.content.scrollToBottom();
      }, 100);
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

  onWithDraw(){
    if (this.formGroup.controls['paymentMethod'].invalid) {
      this.notification.showNotiError('', 'Vui lòng chọn phương thức thanh toán!');
      this.elepaymentMethod.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['bankName'].invalid) {
      this.notification.showNotiError('', 'Ngân hàng không được bỏ trống!');
      this.eleBankName.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['accountNumber'].invalid) {
      this.notification.showNotiError('', 'Số tài khoản không được bỏ trống!');
      this.eleAccountNumber.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['accountName'].invalid) {
      this.notification.showNotiError('', 'Chủ tài khoản không được bỏ trống!');
      this.eleAccountName.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['amount'].invalid) { 
      this.notification.showNotiError('', 'Vui lòng nhập số tiền!');
      this.eleAmount.nativeElement.focus();
      return;
    }
    if (this.formGroup.value.amount < 50000) {
      this.notification.showNotiError('', this.type == 1 ? 'Số tiền nạp tối thiếu phải lớn hơn 50,000đ!' : 'Số tiền rút tối thiếu phải lớn hơn 50,000đ!');
      this.eleAmount.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['note'].invalid) {
      this.notification.showNotiError('', 'Vui lòng nhập nội dung!');
      this.eleNote.nativeElement.focus();
      return;
    }
    this.api.isLoad(true);
    setTimeout(async () => {
      let oData = {...this.formGroup.value};
      oData.amount = oData?.amount.replace(/,/g, '');
      let token = await this.storage.get('token');
      let data = {
        data: JSON.stringify(oData),
        token: token
      }
      let messageBody = {
        dataRequest: JSON.stringify(data)
      };
      this.api.execByBody('Authencation','createwithdraw',messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res && !res?.isError) {
            this.notification.showNotiSuccess('', res.message);
            this.navCtrl.navigateForward('main',{queryParams:{selected:3}});
            this.dt.detectChanges();
          }else{
            this.notification.showNotiError('',res?.message);
            this.dt.detectChanges();
          }
        },
        complete:()=>{
          this.api.isLoad(false);
        }
      })
    }, 1000);
    
  }

  valueChange(event:any,field:any){
    switch(field.toLowerCase()){
      case 'paymentmethod':
        if (event == 1) {
          this.formGroup.controls['bankName'].disable();
          this.formGroup.controls['accountNumber'].disable();
          this.formGroup.controls['accountName'].disable();
        }else{
          this.formGroup.controls['bankName'].enable();
          this.formGroup.controls['accountNumber'].enable();
          this.formGroup.controls['accountName'].enable();
        }
        break;
      case 'amount':
        if (this.eleAmount.nativeElement.value === '-') return;
        let commasRemoved = this.eleAmount.nativeElement.value.replace(/,/g, '');
        let toInt: number;
        let toLocale: string;
        if (commasRemoved.split('.').length > 1) {
          let decimal = isNaN(parseInt(commasRemoved.split('.')[1])) ? '' : parseInt(commasRemoved.split('.')[1]);
          toInt = parseInt(commasRemoved);
          toLocale = toInt.toLocaleString('en-US') + '.' + decimal;
        } else {
          toInt = parseInt(commasRemoved);
          toLocale = toInt.toLocaleString('en-US');
        }
        if (toLocale === 'NaN') {
          this.eleAmount.nativeElement.value = '';
        } else {
          this.eleAmount.nativeElement.value = toLocale;
        }
        break;
    }
  }
}
