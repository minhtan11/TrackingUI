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
  show:any = false;
  private destroy$ = new Subject<void>();
  notifications: any[] = [];
  maxCountdown: string = '';
  intervalId: any;
  constructor(
    private api: ApiserviceComponent,
  ) { }

  ngOnInit() {
    this.getCountdounw();
    //this.startCountdown();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startCountdown() {
    if (!this.notifications.length) return;

    // Tìm object có endDate xa nhất
    const maxEndObj = this.notifications.reduce((max, cur) => {
      return new Date(cur.enDate) > new Date(max.enDate) ? cur : max;
    });

    const end = new Date(maxEndObj.enDate).getTime();

    this.intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = end - now;

      if (distance <= 0) {
        this.show = false;
        clearInterval(this.intervalId);
        return;
      }

      this.show = true;

      // tổng giờ còn lại
      const totalHours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.maxCountdown = `${totalHours}h:${minutes}m:${seconds}s`;
    }, 1000);
  }

  getCountdounw(){
    this.api.execByBody('Authencation', 'getsystemnotifications',null).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res && res?.length){
        console.log(res);
        let lst = res;
        this.notifications = lst.map((n:any) => ({
          ...n,
        }));
        this.startCountdown();
      } 
    })
  }
}
