import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';
import { OrderPageComponent } from './order-page/order-page.component';
import { OrderPageDetailComponent } from './order-page/order-page-detail/order-page-detail.component';
import { PackagePageComponent } from './package-page/package-page.component';
import { RechargePageComponent } from './recharge-page/recharge-page.component';
import { ServicechargePageComponent } from './servicecharge-page/servicecharge-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { HistoryPageComponent } from './history-page/history-page.component';
import { NotificationPageComponent } from './notification-page/notification-page.component';
import { SettingPageComponent } from './setting-page/setting-page.component';
import { FindPageComponent } from './package-page/find-page/find-page.component';

const routes: Routes = [
  {
    path: '',
    component: MainPage,
    children:[
      {
        path: 'home',
        component: HomePageComponent,
      },
      {
        path: 'history',
        component: HistoryPageComponent,
      },
      {
        path: 'notification',
        component: NotificationPageComponent,
      },
      {
        path: 'setting',
        component: SettingPageComponent,
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: 'order',
    component: OrderPageComponent,
  },
  {
    path: 'order/detail',
    component: OrderPageDetailComponent,
  },
  {
    path: 'package',
    component: PackagePageComponent,
  },
  {
    path: 'package/find',
    component: FindPageComponent,
  },
  {
    path: 'recharge',
    component: RechargePageComponent,
  },
  {
    path: 'service-charge',
    component: ServicechargePageComponent,
  },
  // {
  //   path: 'home',
  //   component: HomePageComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
