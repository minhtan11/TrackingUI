import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Config, ToastController } from '@ionic/angular';
import { Observable, Subject, catchError, debounceTime, map, of, switchMap, takeUntil, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-apiservice',
  templateUrl: './apiservice.component.html',
  styleUrls: ['./apiservice.component.scss'],
})
export class ApiserviceComponent implements OnInit {
  //#region Constructor
  private destroy$ = new Subject<void>();
  private subject = new Subject<any>();
  constructor(
    private toastController: ToastController,
    private http: HttpClient,
  ) { }
  //#endregion Constructor

  //#region Init
  ngOnInit() {

    }
  //#endregion Init

  //#region Function
  execByBody(controller: any, router: any, data: any,showLoading:any = false) {
    if(showLoading) this.isLoad(true);
    return this.http.post(environment.apiUrl + controller + '/' + router, data).pipe(catchError(this.handleError), takeUntil(this.destroy$),switchMap((response)=>{
      if(showLoading) this.isLoad(false);
      return of(response);
    }))
  }

  isLoad(type: any = false) {
    let loader = document.getElementById('loader-icon');
    if (loader) {
      if (type) {
        loader.style.visibility = 'visible';
      } else {
        loader.style.visibility = 'hidden';
      }
    }
  }

  private async handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      const toast = await this.toastController.create({
        message: 'Trakuaidi hiện đang gặp lỗi.Vui lòng thử lại!',
        duration: 3000,
        position: 'top',
        positionAnchor: 'header',
        color: 'danger',
        icon: 'alert-circle-outline',
      });
      await toast.present();
      // A client-side or network error occurred. Handle it accordingly.
      // Swal.mixin({
      //   toast: true,
      //   position: 'bottom',
      //   buttonsStyling: false,
      //   showConfirmButton: false,
      //   timer: 5000,
      //   timerProgressBar: false,
      // }).fire({
      //   icon: "error",
      //   title: '',
      //   text: 'Tracking hiện đang gặp lỗi.Vui lòng thử lại!',
      //   heightAuto: false
      // });
    } else {
      const toast = await this.toastController.create({
        message: 'Đã có lỗi xảy ra trong quá trình thực thi hệ thống!',
        duration: 3000,
        position: 'top',
        positionAnchor: 'header',
        color: 'danger',
        icon: 'alert-circle-outline',
      });
      await toast.present();
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      // console.error(
      //   `Backend returned code ${error.status}, body was: `, error.error);
      // Swal.mixin({
      //   toast: true,
      //   position: 'bottom',
      //   buttonsStyling: false,
      //   showConfirmButton: false,
      //   timer: 5000,
      //   timerProgressBar: false,
      // }).fire({
      //   icon: "error",
      //   title: '',
      //   text: 'Đã có lỗi xảy ra trong quá trình thực thi hệ thống!',
      //   heightAuto: false
      // });
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
