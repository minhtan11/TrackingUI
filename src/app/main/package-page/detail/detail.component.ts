import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent  implements OnInit {
  oData:any;
  username:any;
  isOpenEditPackage:any = false;
  isOpenCheckPackage:any = false;
  isOpenCheckPackage2:any = false;
  isOpenCancelPackage:any = false;
  isOpenRestorePackage:any = false;
  isOpenDeletePackage:any = false;
  private destroy$ = new Subject<void>();
  constructor(
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
    private api : ApiserviceComponent,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
  ) { 
    
  }

  async ngOnInit() {
    
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ionViewWillEnter(){
    this.oData = JSON.parse(this.rt.snapshot.queryParams['data']);
    this.username = await this.storage.get('username');
    this.dt.detectChanges();
  }

  ionViewWillLeave(){
    this.onDestroy();
  }

  onback(){
    this.navCtrl.navigateBack('main/package');
  }

  onCopy(){
    this.notification.showNotiSuccess('','Đã Sao chép',1000);
  }

  //#region Edit package
  openPopPackage(item:any){
    this.isOpenEditPackage = true;
  }

  cancelEdit(){
    this.isOpenEditPackage = false;
    this.dt.detectChanges();
  }

  editPackage(item:any){
    this.cancelEdit();
    let data = JSON.stringify(item);
    this.navCtrl.navigateForward('main/package/create',{queryParams:{data:data,isEdit:true}});
  }
  //#endregion Edit package

  //#region CheckPackage
  openPopCheckPackage(item:any){
    this.isOpenCheckPackage = true;
  }

  cancelCheck(){
    this.isOpenCheckPackage = false;
    this.dt.detectChanges();
  }

  openPopCheckPackage2(item:any){
    this.isOpenCheckPackage2 = true;
    this.dt.detectChanges();
  }

  cancelCheck2(){
    this.isOpenCheckPackage2 = false;
    this.dt.detectChanges();
  }

  continuteCheck(item:any){
    this.cancelCheck();
    this.dt.detectChanges();
    let data = {
      id: item.packageCode,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'checkavailable', messageBody).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if (res[0]) {
          this.notification.showNotiError('', res[1].message);
          this.api.isLoad(false);
        } else {
          if (res[1] == 0) {
            this.api.isLoad(false);
            this.openPopCheckPackage2(item);
          }else{
            this.checkPackage(item);
          }
        }
      })
    }, 500);
  }

  checkPackage(item:any){
    this.cancelCheck2();
    this.api.isLoad(true);
    setTimeout(() => {
      let data = {
        id: item.packageCode,
        userName: this.username
      }
      let messageBody = {
        dataRequest: JSON.stringify(data)
      };
      this.api.execByBody('Authencation', 'checkstatus', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          } else {
            this.navCtrl.navigateForward('main/package/orderstatus',{ queryParams: {data: JSON.stringify(res[1])}});
          }
        },
        complete:()=>{
          this.api.isLoad(false);
          this.onDestroy();
        }
      })
    }, 500);
  }
  //#endregion CheckPackage

  //#region CancelPackage
  openPopCancelPackage(item:any){
    this.isOpenCancelPackage = true;
  }

  cancelPopPackage(){
    this.isOpenCancelPackage = false;
    this.dt.detectChanges();
  }

  cancelPackage(item:any){
    this.cancelPopPackage();
    let data = {
      id: item.id,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'cancel', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            if (!res[1].isError) {
              this.notification.showNotiSuccess('', res[1].message);
              this.navCtrl.navigateBack('main/package',{queryParams:{type:'change',dataUpdate:JSON.stringify(res[2])}});
            } else {
              this.notification.showNotiError('', res[1].message);
            }
          }
        },
        complete:()=>{
          this.api.isLoad(false);
          this.onDestroy();
        }
      })
    }, 1000);
  }
  //#endregion

  //#region restorePackage
  openPopRestorePackage(item:any){
    this.isOpenRestorePackage = true;
  }

  cancelRestorePackage(){
    this.isOpenRestorePackage = false;
    this.dt.detectChanges();
  }

  restorePackage(item:any){
    this.cancelRestorePackage();
    let data = {
      id: item.id,
      userName: this.username
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'restorepackage', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            if (!res[1].isError) {
              this.notification.showNotiSuccess('', res[1].message);
              this.navCtrl.navigateBack('main/package',{queryParams:{type:'change',dataUpdate:JSON.stringify(res[2])}});
            } else {
              this.notification.showNotiError('', res[1].message);
            }
          }
        },
        complete:()=>{
          this.api.isLoad(false);
          this.onDestroy();
        }
      })
    }, 1000);
  }
  //#endregion

  //#region DeletePackage
  openPopDeletePackage(item:any){
    this.isOpenDeletePackage = true;
  }

  cancelDeletePackage(){
    this.isOpenDeletePackage = false;
    this.dt.detectChanges();
  }

  deletePackage(item:any){
    this.cancelDeletePackage();
    let data = {
      id: item.id,
    }
    let messageBody = {
      dataRequest: JSON.stringify(data)
    };
    this.api.isLoad(true);
    setTimeout(() => {
      this.api.execByBody('Authencation', 'deletepackage', messageBody).pipe(takeUntil(this.destroy$)).subscribe({
        next:(res:any)=>{
          if (res[0]) {
            this.notification.showNotiError('', res[1].message);
          }else{
            if (!res[1].isError) {
              this.notification.showNotiSuccess('', res[1].message);
              this.navCtrl.navigateBack('main/package',{queryParams:{type:'delete',dataDelete:JSON.stringify(this.oData)}});
            } else {
              this.notification.showNotiError('', res[1].message);
            }
          }
        },
        complete:()=>{
          this.api.isLoad(false);
          this.onDestroy();
        }
      })
    }, 1000);
  }
  //#endregion
}
