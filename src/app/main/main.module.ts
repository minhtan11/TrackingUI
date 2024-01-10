import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';
import { OrderPageComponent } from './order-page/order-page.component';
import { OrderPageDetailComponent } from './order-page/order-page-detail/order-page-detail.component';
import { PackagePageComponent } from './package-page/package-page.component';
import { RechargePageComponent } from './recharge-page/recharge-page.component';
import { ServicechargePageComponent } from './servicecharge-page/servicecharge-page.component';
import { MatTabsModule } from '@angular/material/tabs';
import { HomePageComponent } from './home-page/home-page.component';
import { HistoryPageComponent } from './history-page/history-page.component';
import { NotificationPageComponent } from './notification-page/notification-page.component';
import { SettingPageComponent } from './setting-page/setting-page.component';
import { MatButtonModule } from '@angular/material/button';
import { DecodeVNPipe } from '../pipe/decode-VN/decode-vn.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    MatTabsModule,
    MatButtonModule,
  ],
  declarations: [MainPage, OrderPageComponent, OrderPageDetailComponent, PackagePageComponent, RechargePageComponent, ServicechargePageComponent, HomePageComponent, HistoryPageComponent, NotificationPageComponent,SettingPageComponent
  ,DecodeVNPipe]
})
export class MainPageModule { }
