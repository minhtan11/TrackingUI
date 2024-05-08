import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePageComponent  implements OnInit {
  //#region Constructor
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
    private storage: StorageService,
    private router:Router
  ) {
   }
  //#endregion

  //#region Init

  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      packageCode: ['',Validators.required],
      movingMethod: [Validators.required],
      wareHouse: [Validators.required],
      isWoodPackage: [false],
      isAirPackage: [false],
      isInsurance: [false],
      declaration: ['',Validators.required],
      declarePrice: ['',Validators.required],
      username:[this.username]
    });
    this.username = await this.storage.get('username');
    let code = this.rt.snapshot.queryParams["code"];
    if (code) {
      this.formGroup.patchValue({packageCode:code});
    }
    this.formGroup.patchValue({username:this.username});
  }

  ionViewWillEnter(){
  }

  ionViewWillLeave(){
    this.onDestroy();
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion

  //#region Functione
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
      if (this.formGroup.controls['declarePrice'].invalid) {
        this.notification.showNotiError('', 'Vui lòng kê khai thông tin để tính phí bảo hiểm!');
        this.eleDeclarePrice.nativeElement.focus();
        return;
      }
    }
    setTimeout(() => {
      let oData = {...this.formGroup.value};
      if (oData?.isInsurance) {
        oData.declarePrice = oData?.declarePrice.replace(/,/g, '');
      }
      this.api.execByBody('Authencation','createpackage',oData,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
        }else{
          if (!res[1].isError) {
            this.notification.showNotiSuccess('', res[1].message);
            this.dt.detectChanges();
            this.navCtrl.navigateForward('main/package');
          }else{
            this.notification.showNotiError('',res[1].message);
            this.dt.detectChanges();
          }
        }
      })
    }, 100);
  }

  reset(){
    this.formGroup.reset();
  }

  valueChange(event:any,field:any){
    switch(field.toLowerCase()){
      case 'declareprice':
        if (this.eleDeclarePrice.nativeElement.value === '-') return;
        let commasRemoved = this.eleDeclarePrice.nativeElement.value.replace(/,/g, '');
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
          this.eleDeclarePrice.nativeElement.value = '';
        } else {
          this.eleDeclarePrice.nativeElement.value = toLocale;
        }
        break;
    }
  }

  onback(){
    this.navCtrl.navigateBack('main/package',{queryParams:{type:'default'}});
  }
  //#endregion
}
