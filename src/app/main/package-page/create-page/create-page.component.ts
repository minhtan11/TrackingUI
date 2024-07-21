import { formatNumber } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController, Platform } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import { Clipboard, ReadResult } from '@capacitor/clipboard';
import { PreviousRouterServiceService } from 'src/app/previous-router-service/previous-router-service.service';

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
  previousUrl:any ='';
  numAdd:any=0;
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
    private previous:PreviousRouterServiceService
  ) {
   }
  //#endregion

  //#region Init

  ngOnInit() {
    
  }

  async ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
    });
    this.platform.ready().then(async () => {
      this.platform.resume.subscribe(async () => {
        this.checkCopy();
        if ((this.router.url.includes('/main/package/create'))) {
          Clipboard.read().then((clipboardRead: ReadResult) => {
            if (clipboardRead?.value) {
              let value = clipboardRead?.value;
              this.textCopy = value.replace(/(\r\n\s|\r|\n|\s)/g, ',');
              this.isOpenCopy = true;
              
              return;
            }
          });
        }
      });
    })
    this.platform.backButton.subscribeWithPriority(0, (processNextHandler) => {
      if((this.router.url.includes('main/package/create'))){
        this.onback();
        return;
      }
      processNextHandler();
    })
  }

  async ionViewWillEnter(){
    this.isReview = await this.storage.get('isReview');
    this.username = await this.storage.get('username');
    this.formGroup = this.formBuilder.group({
      id:[0],
      packageCode: ['',Validators.required],
      wareHouse: [''],
      isWoodPackage: [false],
      isAirPackage: [false],
      isInsurance: [false],
      isBrand: [false],
      declaration: ['',Validators.required],
      declarePrice: ['',Validators.required],
      note: ['', Validators.maxLength(70)],
      username:[this.username]
    });
    let isEdit = this.rt.snapshot.queryParams["isEdit"];
    if(isEdit){
      this.isEdit = isEdit;
      let data = JSON.parse(this.rt.snapshot.queryParams["data"]);
      if (data) {
        this.formGroup.patchValue(data);
        this.formGroup.controls['packageCode'].disable();
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
    // if (this.formGroup.controls['movingMethod'].invalid) {
    //   this.notification.showNotiError('', 'Hãy chọn loại vận chuyển!');
    //   this.eleMovingMethod.focus();
    //   return;
    // }
    // if (this.formGroup.controls['wareHouse'].invalid) {
    //   this.notification.showNotiError('', 'Hãy chọn kho TQ nhập hàng!');
    //   this.eleWareHouse.focus();
    //   return;
    // }
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
            if ((res[1].typeRequest != '' && res[1].typeRequest != null) && res[1].typeRequest === 'exist') {
              this.navCtrl.navigateForward('main/package/detail', { queryParams: { id: oData?.packageCode } });
            }else{
              if(this.previousUrl.includes('/main/package')){
                this.navCtrl.navigateForward('main/package',{queryParams:{type:'add'}});
                return;
              }
              this.navCtrl.navigateBack(this.previousUrl);
            }
          }else{
            this.notification.showNotiError('',res[1].message);
          }
        }
        this.onDestroy();
      })
  }

  update(){
    let data = this.formGroup.getRawValue();
      this.api.execByBody('Authencation','updatenotepackage',data,true).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
        }else{
          if (!res[1].isError) {
            this.notification.showNotiSuccess('', res[1].message);
            if(this.previousUrl.includes('/main/package/detail')){
              this.navCtrl.navigateBack('main/package/detail',{queryParams:{type:'change',dataUpdate:JSON.stringify(res[2])}});
              return;
            }
            if(this.previousUrl.includes('/main/package')){
              this.navCtrl.navigateBack('main/package',{queryParams:{type:'change',dataUpdate:JSON.stringify(res[2])}});
              return;
            }
            this.navCtrl.navigateBack(this.previousUrl);
          }else{
            this.notification.showNotiError('',res[1].message);
          }
        }
      })
  }

  reset(){
    this.formGroup.reset();
    this.formGroup.patchValue({id:0});
    this.formGroup.patchValue({packageCode:''});
    this.formGroup.patchValue({movingMethod:null});
    this.formGroup.patchValue({wareHouse:null});
    this.formGroup.patchValue({isWoodPackage:false});
    this.formGroup.patchValue({isAirPackage:false});
    this.formGroup.patchValue({isInsurance:false});
    this.formGroup.patchValue({declaration:''});
    this.formGroup.patchValue({declarePrice:''});
    this.formGroup.patchValue({note:''});
    this.formGroup.patchValue({username:this.username});
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
    this.navCtrl.navigateBack(this.previousUrl);
  }

  checkCopy(){
    if ((this.router.url.includes('/main/package/create'))) {
      Clipboard.read().then(async (clipboardRead: ReadResult) => {
        if (clipboardRead?.value) {
          let value = clipboardRead?.value;
          let text = value.replace(/(\r\n\s|\r|\n|\s)/g, ',');
          if (text.length < 100) {
            let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
              '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
              '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
              '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
              '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
              '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
            if (!pattern.test(text)) {
              let data = await this.storage.get('lstHistory');
              if (data) {
                let lstHistory = [];
                lstHistory = JSON.parse(data);
                let index = lstHistory.findIndex((x:any) => x.id === text);
                if (index > -1) {
                  let obj = lstHistory[index];
                  let now = new Date().toISOString();
                  let exprireDate = Date.parse(obj.exprireTime);
                  if (Date.parse(now) > exprireDate) {
                    lstHistory.splice(index, 1);
                    this.storage.set('lstHistory', JSON.stringify(lstHistory));
                    this.textCopy = text;
                    this.isOpenCopy = true;
                  }
                }else{
                  this.textCopy = text;
                  this.isOpenCopy = true;
                }
              }else{
                this.textCopy = text;
                this.isOpenCopy = true;
              }
            }
          }
          return;
        }
      });
    }
  }

  onCopy(){
    this.isOpenCopy = false;
    this.dt.detectChanges();
    this.formGroup.patchValue({packageCode:this.textCopy});
    Clipboard.write({string:''});
  }

  async cancelCopy(){
    let now = new Date();
    now.setHours(now.getHours() + 3);
    let lstHistory = [];
    let obj = {
      id: this.textCopy,
      exprireTime: now
    }
    let data = await this.storage.get('lstHistory');
    if (data) {
      lstHistory = JSON.parse(data);
    }
    lstHistory.push(obj);
    this.storage.set('lstHistory', JSON.stringify(lstHistory));
    this.isOpenCopy = false;
    this.dt.detectChanges();
  }

  onfocus(ele:any){
    if (ele) {
      ele.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }
  //#endregion
}
