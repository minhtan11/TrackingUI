import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusComponent  implements OnInit {
  oData:any;
  arrayChange:any = [];
  constructor(
    private dt : ChangeDetectorRef,
    private rt : ActivatedRoute,
    private navCtrl: NavController,
  ) { 
    this.oData = JSON.parse(this.rt.snapshot.queryParams['result']);
    let data = JSON.parse(this.rt.snapshot.queryParams['data']);
    this.arrayChange.push(data);
  }

  ngOnInit() {}

  trackByFn(index:any, item:any) { 
    return index; 
  }

  ionViewWillLeave(){
    this.arrayChange = [];
  }

  onback(){
    if (this.arrayChange.length) {
      this.navCtrl.navigateForward('main/package',{queryParams:{type:'change',lstdata:JSON.stringify(this.arrayChange)}});
    }else{
      this.navCtrl.navigateForward('main/package');
    }
  }
}
