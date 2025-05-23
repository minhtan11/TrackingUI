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
import { CreatePageComponent } from './package-page/create-page/create-page.component';
import { AuthGuard } from '../authguardservice/authguard.guard';
import { DetailComponent } from './package-page/detail/detail.component';
import { OrderStatusComponent } from './package-page/order-status/order-status.component';
import { InfomationPageComponent } from './setting-page/infomation-page/infomation-page.component';
import { WithdrawPageComponent } from './setting-page/withdraw-page/withdraw-page.component';
import { ChangepasswordPageComponent } from './setting-page/changepassword-page/changepassword-page.component';
import { ReportPageComponent } from './setting-page/report-page/report-page.component';
import { RelulationPageComponent } from './relulation-page/relulation-page.component';
import { FaqPageComponent } from './setting-page/faq-page/faq-page.component';
import { ExchangePageComponent } from './setting-page/exchange-page/exchange-page.component';
import { PaymentDoneComponent } from './order-page/payment-done/payment-done.component';

const routes: Routes = [
  {
    path: '',
    component: MainPage,
    children:[
      {
        path: 'mainpage',
        component: HomePageComponent,
      },
      {
        path: 'order',
        component: OrderPageComponent,
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
        path: 'package',
        component: PackagePageComponent,
      },
      // {
      //   path: '',
      //   redirectTo: 'mainpage',
      //   pathMatch: 'full'
      // },
    ]
  },
  {
    path: 'history',
    component: HistoryPageComponent,
  },
  {
    path: 'regulation',
    component: RelulationPageComponent,
  },
  {
    path: 'package/create',
    component: CreatePageComponent,
  },
  {
    path: 'package/detail',
    component: DetailComponent,
  },
  {
    path: 'package/orderstatus',
    component: OrderStatusComponent,
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
    path: 'order/paymentdone',
    component: PaymentDoneComponent,
  },
  {
    path: 'recharge',
    component: RechargePageComponent,
  },
  {
    path: 'service-charge',
    component: ServicechargePageComponent,
  },
  {
    path: 'setting/information',
    component: InfomationPageComponent,
  },
  {
    path: 'setting/withdraw',
    component: WithdrawPageComponent,
  },
  {
    path: 'setting/changepassword',
    component: ChangepasswordPageComponent,
  },
  {
    path: 'setting/report',
    component: ReportPageComponent,
  },
  {
    path: 'setting/faq',
    component: FaqPageComponent,
  },
  {
    path: 'setting/exchange',
    component: ExchangePageComponent,
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
