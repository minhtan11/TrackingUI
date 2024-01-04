import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-order-page-detail',
  templateUrl: './order-page-detail.component.html',
  styleUrls: ['./order-page-detail.component.scss'],
})
export class OrderPageDetailComponent  implements OnInit {

  constructor(
    private navCtrl: NavController,
    private router: ActivatedRoute
  ) { }

  ngOnInit() {
    this.router.queryParams
      .subscribe((params) => {
        console.log(params);
      });
  }

}
