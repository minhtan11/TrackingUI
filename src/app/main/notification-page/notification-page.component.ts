import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPageComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
