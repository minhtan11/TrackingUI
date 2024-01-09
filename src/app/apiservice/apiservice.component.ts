import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Config } from '@ionic/angular';
import { Subject, catchError, takeUntil, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-apiservice',
  templateUrl: './apiservice.component.html',
  styleUrls: ['./apiservice.component.scss'],
})
export class ApiserviceComponent  implements OnInit {
  //#region Constructor
  private destroy$ = new Subject<void>();
  private subject = new Subject<any>();
  constructor(
    private http : HttpClient,
  ) { }
//#endregion Constructor

//#region Init
ngOnInit() {
  
}
//#endregion Init

//#region Function
execByParameter(controller:any,router:any,queryParams:any,showLoading:any = false) {
  if(showLoading) this.isLoad(true);
  this.http.get<Config>(environment.apiUrl+controller+'/'+router,{params:queryParams}).pipe(catchError(this.handleError),takeUntil(this.destroy$)).subscribe((res)=>{
    if(showLoading) this.isLoad(false);
    this.subject.next(res);
  })
  return this.subject.asObservable();
}

execByBody(controller:any,router:any,data:any,showLoading:any = false) {
  if(showLoading) this.isLoad(true);
  this.http.post(environment.apiUrl+controller+'/'+router,data).pipe(catchError(this.handleError),takeUntil(this.destroy$)).subscribe((res)=>{
    if(showLoading) this.isLoad(false);
    this.subject.next(res);
  })
  return this.subject.asObservable();
}

isLoad(type:any = false){
  let loader = document.getElementById('loader');
  if (loader) {
    if (type) {
      loader.style.visibility = 'visible';
    }else{
      loader.style.visibility = 'hidden';
    }
  }
}

private handleError(error: HttpErrorResponse) {
  if (error.status === 0) {
    // A client-side or network error occurred. Handle it accordingly.
    Swal.mixin({
      toast:true,
      position:'bottom',
      buttonsStyling: false,
      showConfirmButton:false,
      timer: 1000,
      timerProgressBar: true,
    }).fire({
      icon: "error",
      title: '',
      text: 'Mất kết nối!',
      heightAuto: false
    });
  } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong.
    // console.error(
    //   `Backend returned code ${error.status}, body was: `, error.error);
    Swal.mixin({
      toast:true,
      position:'bottom',
      buttonsStyling: false,
      showConfirmButton:false,
      timer: 1500,
      timerProgressBar: true,
    }).fire({
      icon: "error",
      title: '',
      text: 'Đã có lỗi xảy ra trong quá trình thực thi hệ thống!',
      heightAuto: false
    });
  }
  let loader = document.getElementById('loader');
  if (loader) {
    loader.style.visibility = 'hidden';
  }
  // Return an observable with a user-facing error message.
  return throwError(() => new Error('Something bad happened; please try again later.'));
}
//#endregion Function
}
