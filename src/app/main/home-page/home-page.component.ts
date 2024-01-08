import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent  implements OnInit,AfterViewInit {

  constructor(
    private router: Router,
    private dt : ChangeDetectorRef,
  ) { }

  ngOnInit() {}

  ngAfterViewInit(): void {
    
  }

  goOrderPage(){
    this.router.navigate(['main/order']);
  }

  goPackagePage(){
    this.router.navigate(['main/package']);
  }

  goRechargePage(){
    this.router.navigate(['main/recharge']);
  }

  goServicechargePage(){
    this.router.navigate(['main/service-charge']);
  }

}
