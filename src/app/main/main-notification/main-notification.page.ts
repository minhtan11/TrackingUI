import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-notification',
  templateUrl: './main-notification.page.html',
  styleUrls: ['./main-notification.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNotificationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
