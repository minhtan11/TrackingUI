import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePageComponent  implements OnInit {
  @ViewChild('elePackageCode') elePackageCode: any;
  @ViewChild('eleMovingMethod') eleMovingMethod: any;
  @ViewChild('eleWareHouse') eleWareHouse: any;
  @ViewChild('eleDeclaration') eleDeclaration: any;
  @ViewChild('eleDeclarePrice') eleDeclarePrice: any;
  username:any='';
  isExec:any=false;
  private destroy$ = new Subject<void>();
  formGroup!: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private notification: NotificationServiceComponent,
    private api: ApiserviceComponent,
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
    private navCtrl: NavController,
  ) {
    this.username = this.rt.snapshot.params['username'];
   }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      packageCode: ['',Validators.required],
      movingMethod: ['',Validators.required],
      wareHouse: ['',Validators.required],
      isWoodPackage: [false],
      isAirPackage: [false],
      isInsurance: [false],
      declaration: ['',Validators.required],
      declarePrice: [0,Validators.required],
      username:[this.username]
    });
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(){
    if (this.formGroup.controls['packageCode'].invalid) {
      this.notification.showNotiError('', 'Vui lòng nhập mã kiện!');
      this.elePackageCode.nativeElement.focus();
      return;
    }
    if (this.formGroup.controls['movingMethod'].invalid) {
      this.notification.showNotiError('', 'Hãy chọn loại vận chuyển!');
      this.eleMovingMethod.focus();
      return;
    }
    if (this.formGroup.controls['wareHouse'].invalid) {
      this.notification.showNotiError('', 'Hãy chọn kho TQ nhập hàng!');
      this.eleWareHouse.focus();
      return;
    }
    if(this.formGroup.value.isInsurance){
      if (this.formGroup.controls['declaration'].invalid) {
        this.notification.showNotiError('', 'Vui lòng kê khai thông tin để tính phí bảo hiểm!');
        this.eleDeclaration.nativeElement.focus();
        return;
      }
      if (this.formGroup.controls['declarePrice'].invalid || this.formGroup.value.declarePrice == 0) {
        this.notification.showNotiError('', 'Vui lòng kê khai thông tin để tính phí bảo hiểm!');
        this.eleDeclarePrice.nativeElement.focus();
        return;
      }
    }
    this.isExec = true;
    this.dt.detectChanges();
    setTimeout(() => {
      this.api.execByBody('Authencation','createpackage',this.formGroup.value).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if (res && !res?.isError) {
          this.isExec = false;
          this.notification.showNotiSuccess('', res?.message);
          this.navCtrl.navigateForward('main/package/'+this.username);
          this.onDestroy();
          this.dt.detectChanges();
          
        }else{
          this.isExec = false;
          this.notification.showNotiError('',res?.message);
          this.dt.detectChanges();
        }
      })
    }, 100);
  }

  reset(){
    this.formGroup.reset();
  }

  change(event:any){
    this.formGroup.patchValue({declaration:'',declarePrice:0});
  }
}
