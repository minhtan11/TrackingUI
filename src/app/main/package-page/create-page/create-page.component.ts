import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  private destroy$ = new Subject<void>();
  formGroup!: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private notification: NotificationServiceComponent,
    private api: ApiserviceComponent,
    private rt : ActivatedRoute,
  ) {
    this.username = this.rt.snapshot.queryParams['username'];
   }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      packageCode: ['',Validators.required],
      movingMethod: ['',Validators.required],
      wareHouse: ['',Validators.required],
      isWoodPackage: [false],
      isAirPackage: [false],
      isInsurance: [false],
      // declaration: ['',Validators.required],
      // declarePrice: [0,Validators.required],
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
    // if(this.formGroup.value.isInsurance){
    //   if (this.formGroup.controls['declaration'].invalid) {
    //     this.notification.showNotiError('', 'Vui lòng kê khai thông tin để tính phí bảo hiểm!');
    //     this.eleDeclaration.nativeElement.focus();
    //     return;
    //   }
    //   if (this.formGroup.controls['declarePrice'].invalid || this.formGroup.value.declarePrice == 0) {
    //     this.notification.showNotiError('', 'Vui lòng kê khai thông tin để tính phí bảo hiểm!');
    //     this.eleDeclarePrice.nativeElement.focus();
    //     return;
    //   }
    // }
    // let queryParams = new HttpParams();
    // queryParams = queryParams.append("data", this.formGroup.value);
    // queryParams = queryParams.append("userName", this.username);
    // this.api.execByParameter('Authencation', 'createpackage', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
    //   // if (res) {
    //   //   res[0].forEach((data:any) => {
    //   //     this.lstData.push(data);
    //   //   });
    //   //   this.isEmpty = false;
    //   //   if(this.lstData.length == 0) this.isEmpty = true;
    //   //   if(this.lstData.length == res[1]) this.isload = false;
    //   //   this.dt.detectChanges();
    //   // }
    //   console.log(res);
    //   this.onDestroy();
    // })
    this.api.execByBody('Authencation','createpackage',this.formGroup.value).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      
    })
  }

  reset(){
    this.formGroup.reset();
  }

  change(event:any){
    this.formGroup.patchValue({declaration:'',declarePrice:0});
  }
}
