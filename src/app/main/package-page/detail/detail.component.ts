import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent  implements OnInit {
  oData:any;
  constructor(
    private rt : ActivatedRoute,
  ) { 
    this.oData = JSON.parse(this.rt.snapshot.queryParams['data']);
  }

  ngOnInit() {}

  checkStatus(){}

}
