import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';
import { HomePageComponent } from './home-page/home-page.component';
import { OrderPageComponent } from './order-page/order-page.component';
import { OrderPageDetailComponent } from './order-page/order-page-detail/order-page-detail.component';
import { PackagePageComponent } from './package-page/package-page.component';
import { RechargePageComponent } from './recharge-page/recharge-page.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot({mode:'ios'}),
    MainPageRoutingModule
  ],
  declarations: [MainPage,HomePageComponent,OrderPageComponent,OrderPageDetailComponent,PackagePageComponent,RechargePageComponent]
})
export class MainPageModule {}
