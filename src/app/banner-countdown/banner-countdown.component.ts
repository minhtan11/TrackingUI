import { Component, Input, OnInit } from '@angular/core';

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
  show: boolean = false;
  private intervalId: any;
  constructor() { }

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startCountdown() {
    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime();

    this.intervalId = setInterval(() => {
      const now = new Date().getTime();

      // chưa đến ngày
      if (now < start) {
        this.show = false;
        return;
      }

      const distance = end - now;
      if (distance <= 0) {
        this.show = false;
        clearInterval(this.intervalId);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdown = `${hours}:${minutes}:${seconds}`;
      this.show = true;
    }, 1000);
  }
}
