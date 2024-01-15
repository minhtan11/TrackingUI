import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';

@Component({
  selector: 'app-find-page',
  templateUrl: './find-page.component.html',
  styleUrls: ['./find-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindPageComponent  implements OnInit {
  formGroup!: FormGroup;
  status:any = 0;
  lstData:any = [];
  isExec:any=false;
  pageNum:any = 1;
  pageSize:any = 10;
  username:any;
  isEmpty:any = false;
  isload:any=true;
  private destroy$ = new Subject<void>();
  constructor(
    private formBuilder: FormBuilder,
    private api: ApiserviceComponent,
    private rt : ActivatedRoute,
    private dt : ChangeDetectorRef,
  ) { 
    this.username = this.rt.snapshot.queryParams['username'];
  }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      fromDate: new FormControl({value: null, disabled: true}),
      toDate: new FormControl({value: null, disabled: true}),
      id: [null],
    });
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  find(){
    let queryParams = new HttpParams();
      queryParams = queryParams.append("status", this.status);
      queryParams = queryParams.append("id", this.formGroup.value.id);
      queryParams = queryParams.append("fromDate", this.formGroup.value.fromDate);
      queryParams = queryParams.append("toDate", this.formGroup.value.toDate);
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

}
