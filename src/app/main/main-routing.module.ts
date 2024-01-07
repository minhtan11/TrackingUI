import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';
import { OrderPageComponent } from './order-page/order-page.component';
import { OrderPageDetailComponent } from './order-page/order-page-detail/order-page-detail.component';
import { PackagePageComponent } from './package-page/package-page.component';
import { RechargePageComponent } from './recharge-page/recharge-page.component';
import { ServicechargePageComponent } from './servicecharge-page/servicecharge-page.component';

const routes: Routes = [
  {
    path: '',
    component: MainPage,
    children:[
      {
        path: 'home',
        loadChildren: () => import('./main-home/main-home.module').then( m => m.MainHomePageModule)
      },
      {
        path: 'history',
        loadChildren: () => import('./main-history/main-history.module').then( m => m.MainHistoryPageModule)
      },
      {
        path: 'notification',
        loadChildren: () => import('./main-notification/main-notification.module').then( m => m.MainNotificationPageModule)
      },
      {
        path: 'setting',
        loadChildren: () => import('./main-setting/main-setting.module').then( m => m.MainSettingPageModule)
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
    path: 'recharge',
    component: RechargePageComponent,
  },
  {
    path: 'service-charge',
    component: ServicechargePageComponent,
  },
  

  

  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
