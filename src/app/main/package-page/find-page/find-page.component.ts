import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';

@Component({
  selector: 'app-find-page',
  templateUrl: './find-page.component.html',
  styleUrls: ['./find-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindPageComponent  implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  formGroup!: FormGroup;
  status:any = 0;
  lstData:any = [];
  pageNum:any = 1;
  pageSize:any = 10;
  username:any;
  isEmpty:any = true;
  isload:any=true;

  id:any='';
  private destroy$ = new Subject<void>();
  constructor(
    private formBuilder: FormBuilder,
    private api: ApiserviceComponent,
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
    private navCtrl: NavController,
  ) { 
    this.username = this.rt.snapshot.params['username'];
  }

  ngOnInit() {
    // this.formGroup = this.formBuilder.group({
    //   fromDate: new FormControl({value: null, disabled: true}),
    //   toDate: new FormControl({value: null, disabled: true}),
    //   id: [null],
    // });
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  // find(){
  //   this.isExec = true;
  //   this.lstData = [];
  //   this.dt.detectChanges();
  //   setTimeout(() => {
  //     this.loadData();
  //   }, 100);
  // }

  loadData(){
    let queryParams = new HttpParams();
      queryParams = queryParams.append("status", this.status);
      queryParams = queryParams.append("id", this.id);
      queryParams = queryParams.append("fromDate", '');
      queryParams = queryParams.append("toDate", '');
      queryParams = queryParams.append("pageNum", this.pageNum);
      queryParams = queryParams.append("pageSize", this.pageSize);
      queryParams = queryParams.append("userName", this.username);
      this.api.execByParameter('Authencation', 'package', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          res[0].forEach((data:any) => {
            this.lstData.push(data);
          });
          this.isEmpty = false;
          if(this.lstData.length == 0) this.isEmpty = true;
          if(this.lstData.length == res[1]) this.isload = false;
          this.dt.detectChanges();
        }
        this.onDestroy();
      })
  }

  async loadPage(event:any){
    let scrollElement = await this.content.getScrollElement();
    if ((scrollElement.scrollTop === scrollElement.scrollHeight - scrollElement.clientHeight) && scrollElement.scrollTop != 0) {
      if(this.isload){
        this.pageNum += 1;
        this.loadData();
      }
    }
  }

  trackByFn(index:any, item:any) { 
    return index; 
  }

  checkStatus(){

  }

  ionChange(event:any){
    this.id = event?.detail?.value || event?.detail;
    if(this.id == null || this.id == ''){
      this.lstData = [];
      this.dt.detectChanges();
    }else{
      this.lstData = [];
      this.loadData();
    }
  }

  viewDetail(data:any){
    this.onDestroy();
    this.navCtrl.navigateForward('main/package/detail/'+this.username,{queryParams:{data:JSON.stringify(data)}});
  }
}
