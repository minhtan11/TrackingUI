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
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.scss'],
})
export class ReportPageComponent  implements OnInit {
  @ViewChild('eleType') eleType: any;
  @ViewChild('eleTransId') eleTransId: any;
  @ViewChild('eleContext') eleContext: any;
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
      type: ['',Validators.required],
      transId: ['', Validators.required],
      context: ['', Validators.required],
      status: [1],
      createdBy:[''],
    });
    let username = await this.storage.get('username');
    this.formGroup.patchValue({createdBy:username});
  }

  async ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
    });
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('main/setting/report'))){
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

  onReport(){
    if (this.formGroup.controls['type'].invalid) {
      this.notification.showNotiError('', 'Vui lòng chọn hình thức khiếu nại!');
      this.eleType.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['transId'].invalid) {
      this.notification.showNotiError('', 'Mã đơn hàng không được bỏ trống!');
      this.eleTransId.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['context'].invalid) {
      this.notification.showNotiError('', 'Nội dung không được bỏ trống!');
      this.eleContext.nativeElement.focus();
      return;
    }
    this.api.execByBody('Authencation','createcomplain',this.formGroup.value,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res && !res?.isError) {
        this.notification.showNotiSuccess('', res.message);
        this.navCtrl.navigateBack(this.previousUrl);
        
      }else{
        this.notification.showNotiError('',res?.message);
      }
    })
  }
}
