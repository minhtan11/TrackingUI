import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-transaction-history-page',
  templateUrl: './transaction-history-page.component.html',
  styleUrls: ['./transaction-history-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionHistoryPageComponent  implements OnInit,AfterViewInit,OnDestroy {
  private destroy$ = new Subject<void>();
  constructor(
    private dt : ChangeDetectorRef,
    private navCtrl: NavController
  ) { }

  ngOnInit() {}

  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

}
