import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportPageComponent  implements OnInit {
  @ViewChild('eleType') eleType: any;
  @ViewChild('eleTransId') eleTransId: any;
  @ViewChild('eleContext') eleContext: any;
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
  }

  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      type: ['',Validators.required],
      transId: ['', Validators.required],
      context: ['', Validators.required],
      status: [1],
      createdBy:[''],
      createdDate:[Date.now()]
    });
    let username = await this.storage.get('username');
    this.formGroup.patchValue({createdBy:username});
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

  onback(){
    this.navCtrl.navigateBack('main');
  }

  onReport(){
    if (this.formGroup.controls['type'].invalid) {
      this.notification.showNotiError('', 'Vui lòng chọn hình thức khiếu nại!');
      this.eleType.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['tranId'].invalid) {
      this.notification.showNotiError('', 'Mã đơn hàng không được bỏ trống!');
      this.eleTransId.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['context'].invalid) {
      this.notification.showNotiError('', 'Nội dung không được bỏ trống!');
      this.eleContext.nativeElement.focus();
      return;
    }
    this.api.isLoad(true);
    setTimeout(async () => {
      this.api.execByBody('Authencation','createcomplain',this.formGroup.value).pipe(takeUntil(this.destroy$)).subscribe({
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

}
