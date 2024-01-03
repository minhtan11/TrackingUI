import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit,AfterViewInit {
  isLoad:any = false;
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    
  }

}
