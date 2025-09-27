import { Component, Input, OnInit } from '@angular/core';
import { ApiserviceComponent } from '../apiservice/apiservice.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-banner-countdown',
  templateUrl: './banner-countdown.component.html',
  styleUrls: ['./banner-countdown.component.scss'],
})
export class BannerCountdownComponent{
  @Input() startDate: string = '2025-09-17T00:00:00';
  @Input() endDate: string = '2025-09-23T23:59:59';
  @Input() message: string ='Thời gian thông quan của tất cả các tuyến tăng từ 1-3 ngày do cửa khẩu vẫn đang kiểm tra nghiêm ngặt dẫn đến dự kiến hàng về chậm 1-3 ngày.';
  countdown: string = '';
  private destroy$ = new Subject<void>();
  intervals: any[] = [];
  notifications: any[] = [];
  constructor(
    private api: ApiserviceComponent,
  ) { }

  ngOnInit() {
    this.getCountdounw();
    //this.startCountdown();
  }

  ngOnDestroy() {
    this.intervals.forEach((id) => clearInterval(id));
  }

  startCountdown() {
    this.notifications.forEach((noti, index) => {
      const start = new Date(noti.startDate).getTime();
      const end = new Date(noti.enDate).getTime();

      const intervalId = setInterval(() => {
        const now = new Date().getTime();

        if (now < start) {
          noti.show = false;
          return;
        }

        const distance = end - now;
        if (distance <= 0) {
          noti.show = false;
          clearInterval(intervalId);
          return;
        }

        const totalHours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        noti.countdown = `${totalHours}:${minutes}:${seconds}`;
        noti.show = true;
      }, 1000);

      this.intervals.push(intervalId);
    });
  }

  getCountdounw(){
    this.api.execByBody('Authencation', 'getsystemnotifications',null).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res && res?.length){
        console.log(res);
        let lst = res;
        this.notifications = lst.map((n:any) => ({
          ...n,
          countdown: '',
          show: false
        }));
        this.startCountdown();
      } 
    })
  }
}
