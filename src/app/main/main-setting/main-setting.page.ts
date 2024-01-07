import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-setting',
  templateUrl: './main-setting.page.html',
  styleUrls: ['./main-setting.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSettingPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
