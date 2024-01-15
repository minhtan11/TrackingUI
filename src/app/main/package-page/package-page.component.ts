import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';

@Component({
  selector: 'app-package-page',
  templateUrl: './package-page.component.html',
  styleUrls: ['./package-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagePageComponent  implements OnInit {
  //#region Contrucstor
  @ViewChild(IonContent) content: IonContent;
  pageNum:any = 1;
  pageSize:any = 10;
  fromDate:any = null;
  toDate:any = null;
  username:any;
  status:any = 0;
  id:any='';
  lstData:any = [];
  isEmpty:any = false;
  isExec:any=false;
  total:any = 0;
  isload:any=true;
  private destroy$ = new Subject<void>();
  constructor(
    private dt : ChangeDetectorRef,
    private api : ApiserviceComponent,
    private rt : ActivatedRoute,
    private router:Router
  ) { 
    this.username = this.rt.snapshot.queryParams['username'];
    this.loadData();
  }
  //#endregion

  //#region Init
  ngOnInit() {}
  //#endregion 

  //#region Function

  trackByFn(index:any, item:any) { 
    return index; 
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  sortData(status:any){
    if(this.status == status) return;
    this.status = status;
    this.isload = true;
    this.pageNum = 1;
    this.lstData = [];
    this.isEmpty = false;
    this.isExec = true;
    this.dt.detectChanges();
    setTimeout(() => {
      this.loadData();
    }, 500);
    
  }

  loadData(){
    let queryParams = new HttpParams();
      queryParams = queryParams.append("status", this.status);
      queryParams = queryParams.append("id", this.id);
      queryParams = queryParams.append("fromDate", this.fromDate);
      queryParams = queryParams.append("toDate", this.toDate);
      queryParams = queryParams.append("pageNum", this.pageNum);
      queryParams = queryParams.append("pageSize", this.pageSize);
      queryParams = queryParams.append("userName", this.username);
      this.api.execByParameter('Authencation', 'package', queryParams).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          res[0].forEach((data:any) => {
            this.lstData.push(data);
          });
          console.log(res);
          this.isExec = false;
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

  checkStatus(){

  }

  createPackage(){

  }

  findPackage(){
    this.onDestroy();
    this.router.navigate(['main/package/find',{queryParams:{username:this.username}}]);
  }

  //#endregion
}
