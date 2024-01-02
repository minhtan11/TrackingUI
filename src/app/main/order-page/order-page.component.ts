import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPageComponent  implements OnInit,AfterViewInit,OnDestroy,DoCheck {
  height:any;
  constructor(
    private dt : ChangeDetectorRef,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      let hheader;
      hheader = (document.querySelector('ion-header') as HTMLElement).clientHeight
      this.height = (window.innerHeight - hheader) + 'px';
      this.dt.detectChanges();
      console.log(this.height);
    }, 100);
  }

  ngAfterViewInit() {

  }

  ngDoCheck() {
    
  }

  ngOnDestroy() {
    
  }

}
