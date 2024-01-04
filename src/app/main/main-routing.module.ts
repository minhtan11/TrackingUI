import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';
import { HomePageComponent } from './home-page/home-page.component';
import { OrderPageComponent } from './order-page/order-page.component';
import { OrderPageDetailComponent } from './order-page/order-page-detail/order-page-detail.component';
import { PackagePageComponent } from './package-page/package-page.component';
import { RechargePageComponent } from './recharge-page/recharge-page.component';

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
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
