import { formatNumber } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import { Clipboard, ReadResult } from '@capacitor/clipboard';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.scss']
})
export class CreatePageComponent  implements OnInit {
  //#region Constructor
  @ViewChild('elePackageCode') elePackageCode: any;
  @ViewChild('eleMovingMethod') eleMovingMethod: any;
  @ViewChild('eleWareHouse') eleWareHouse: any;
  @ViewChild('eleDeclaration') eleDeclaration: any;
  @ViewChild('eleDeclarePrice') eleDeclarePrice: any;
  @ViewChild('eleNote') eleNote: any;
  isReview:any;
  username:any='';
  isExec:any=false;
  private destroy$ = new Subject<void>();
  formGroup!: FormGroup;
  isHideFooter:any=false;
  isEdit:any=false;
  isOpenCopy:any=false;
  textCopy:any;
  constructor(
    private formBuilder: FormBuilder,
    private notification: NotificationServiceComponent,
    private api: ApiserviceComponent,
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
    private navCtrl: NavController,
    private storage: StorageService,
    private router:Router,
    private platform : Platform,
  ) {
   }
  //#endregion

  //#region Init

  async ngOnInit() {
    this.formGroup = this.formBuilder.group({
      id:[0],
      packageCode: ['',Validators.required],
      movingMethod: [Validators.required],
      wareHouse: [Validators.required],
      isWoodPackage: [false],
      isAirPackage: [false],
      isInsurance: [false],
      declaration: ['',Validators.required],
      declarePrice: ['',Validators.required],
      note: ['', Validators.maxLength(70)],
      username:['']
    });
    this.username = await this.storage.get('username');
    this.formGroup.patchValue({username:this.username});
    
  }

  ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      //this.isHideFooter = true;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
      this.dt.detectChanges();
    });
    this.platform.ready().then(async () => {
      this.platform.resume.subscribe(async () => {
        if ((this.router.url.includes('/main/package/create'))) {
          Clipboard.read().then((clipboardRead: ReadResult) => {
            if (clipboardRead?.value) {
              let value = clipboardRead?.value;
              this.textCopy = value.replace(/(\r\n\s|\r|\n|\s)/g, ',');
              this.isOpenCopy = true;
              this.dt.detectChanges();
              return;
            }
          });
        }
      });
    })
  }

  async ionViewWillEnter(){
    this.isReview = await this.storage.get('isReview');
    let isEdit = this.rt.snapshot.queryParams["isEdit"];
    if(isEdit){
      this.isEdit = isEdit;
      let data = JSON.parse(this.rt.snapshot.queryParams["data"]);
      if (data) {
        this.formGroup.patchValue(data);
        this.formGroup.controls['packageCode'].disable();
        this.formGroup.controls['movingMethod'].disable();
        this.formGroup.controls['wareHouse'].disable();
        this.formGroup.controls['isWoodPackage'].disable();
        this.formGroup.controls['isAirPackage'].disable();
        this.formGroup.controls['isInsurance'].disable();
        this.formGroup.controls['declaration'].disable();
        this.formGroup.controls['declarePrice'].disable();
        setTimeout(() => {
          if(this.eleNote) this.eleNote.nativeElement.focus();
        }, 500);
      }
    }
    let code = this.rt.snapshot.queryParams["code"];
    if (code) {
      this.formGroup.patchValue({packageCode:code});
    }
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
    this.api.isLoad(true);
    setTimeout(() => {
      let oData = {...this.formGroup.value};
      if (oData?.isInsurance) {
        oData.declarePrice = oData?.declarePrice.replace(/,/g, '');
      }
      this.api.execByBody('Authencation','createpackage',oData).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            if (!res[1].isError) {
              this.notification.showNotiSuccess('', res[1].message);
              this.navCtrl.navigateForward('main/package',{queryParams:{type:'add'}});
            }else{
              this.notification.showNotiError('',res[1].message);
              
            }
          }
        },
        complete:()=>{
          this.api.isLoad(false);
        }
      })
    }, 500);
  }

  update(){
    this.api.isLoad(true);
    setTimeout(() => {
      let data = this.formGroup.getRawValue();
      this.api.execByBody('Authencation','updatenotepackage',data).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            if (!res[1].isError) {
              this.notification.showNotiSuccess('', res[1].message);
              this.navCtrl.navigateBack('main/package',{queryParams:{type:'change',dataUpdate:JSON.stringify(res[2])}});
            }else{
              this.notification.showNotiError('',res[1].message);
            }
          }
        },
        complete:()=>{
          this.api.isLoad(false);
        }
      })
    }, 500);
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
    this.navCtrl.navigateBack('main/package');
  }

  onCopy(){
    this.cancelCopy();
    this.formGroup.patchValue({packageCode:this.textCopy});
  }

  cancelCopy(){
    this.isOpenCopy = false;
    Clipboard.write({
      string: ""
    });
    this.dt.detectChanges();
  }

  onclick(ele:any){
    this.isHideFooter = true;
    this.dt.detectChanges();
    setTimeout(() => {
      ele.scrollIntoView();
    }, 500);
    
  }
  //#endregion
}
