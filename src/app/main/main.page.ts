import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs, NavController } from '@ionic/angular';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage implements OnInit,AfterViewInit {
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private dt : ChangeDetectorRef,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    
  }
  

  goHomePage(){
    this.router.navigate(['main/home']);
  }

  goHistoryPage(){
    this.router.navigate(['main/history']);
  }

  goNofiticationPage(){
    this.router.navigate(['main/notification']);
  }

  goSettingPage(){
    this.router.navigate(['main/setting']);
  }
}
