import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-notification-service',
  templateUrl: './notification-service.component.html',
  styleUrls: ['./notification-service.component.scss'],
})
export class NotificationServiceComponent  implements OnInit {
//#region Constructor
constructor() { }
//#endregion Constructor

//#region Init
ngOnInit() {}
//#endregion Init

//#region Function
showNotiError(title:string,text:string) {
  Swal.mixin({
    toast:true,
    position:'bottom',
    buttonsStyling: false,
    showConfirmButton:false,
    timer: 1500,
    timerProgressBar: true,
  }).fire({
    icon: "error",
    title: title,
    text: text,
  });
}

showNotiSuccess(title:string,text:string) {
  Swal.mixin({
    toast:true,
    position:'bottom',
    buttonsStyling: false,
    showConfirmButton:false,
    timer: 1500,
    timerProgressBar: true,
  }).fire({
    icon: "success",
    title: title,
    text: text,
    heightAuto: false
  });
}

//#endregion Function
}
