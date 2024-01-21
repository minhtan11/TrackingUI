import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusComponent  implements OnInit {
  oData:any;
  constructor(
    private dt : ChangeDetectorRef,
    private rt : ActivatedRoute,
  ) { 
    this.oData = JSON.parse(this.rt.snapshot.queryParams['data']);
  }

  ngOnInit() {}

  trackByFn(index:any, item:any) { 
    return index; 
  }

}
