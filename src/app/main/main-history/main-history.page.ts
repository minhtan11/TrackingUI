import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-history',
  templateUrl: './main-history.page.html',
  styleUrls: ['./main-history.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainHistoryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
