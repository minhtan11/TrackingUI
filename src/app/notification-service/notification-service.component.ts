import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-notification-service',
  templateUrl: './notification-service.component.html',
  styleUrls: ['./notification-service.component.scss'],
})
export class NotificationServiceComponent implements OnInit {
  //#region Constructor
  constructor(private toastController: ToastController) { }
  //#endregion Constructor

  //#region Init
  ngOnInit() { }
  //#endregion Init

  //#region Function
  async showNotiError(title: string, text: string, timer: number = 2500) {
    const toast = await this.toastController.create({
      message: text,
      duration: timer,
      position: 'top',
      positionAnchor: 'header',
      icon: 'alert-circle-outline',
      cssClass:'text-orange bg-toast-white'
    });
    await toast.present();
  }

  async showNotiSuccess(title: string, text: string, timer: number = 2500) {
    const toast = await this.toastController.create({
      message: text,
      duration: timer,
      position: 'top',
      positionAnchor: 'header',
      icon: 'checkmark-circle-outline',
      cssClass:'text-primary-default bg-toast-white'
    });
    await toast.present();
  }

  showConnected() {
    Swal.mixin({
      toast: true,
      position: 'bottom',
      buttonsStyling: false,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: false,
      customClass: {
        icon: "no-border"
      },
    }).fire({
      icon: "success",
      title: '',
      text: "Đã khôi phục kết nối internet",
      iconHtml: "<i style='font-size: 0.8em;' class='bi bi-wifi'></i>",
    });
  }

  showNoConnected() {
    Swal.mixin({
      toast: true,
      position: 'bottom',
      buttonsStyling: false,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: false,
      customClass: {
        icon: "no-border"
      },
    }).fire({
      icon: "question",
      title: '',
      text: "Bạn đang offline",
      iconHtml: "<i style='font-size: 0.8em;' class='bi bi-wifi-off'></i>",
    });
  }

  //#endregion Function
}
