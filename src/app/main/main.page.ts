import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit,AfterViewInit {
  constructor(
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    
  }
}
