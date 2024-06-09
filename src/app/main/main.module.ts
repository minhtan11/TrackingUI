import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import {MatStepperModule} from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CreatePageComponent } from './package-page/create-page/create-page.component';
import { NotificationServiceComponent } from '../notification-service/notification-service.component';
import { MatSelectModule } from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { DetailComponent } from './package-page/detail/detail.component';
import { OrderStatusComponent } from './package-page/order-status/order-status.component';
import { InfomationPageComponent } from './setting-page/infomation-page/infomation-page.component';
import { WithdrawPageComponent } from './setting-page/withdraw-page/withdraw-page.component';
import { ChangepasswordPageComponent } from './setting-page/changepassword-page/changepassword-page.component';
import { FormatdatePipe } from '../pipe/format-date/formatdate.pipe';
import { ReportPageComponent } from './setting-page/report-page/report-page.component';
import { PreviousRouterServiceService } from '../previous-router-service/previous-router-service.service';
import { RelulationPageComponent } from './relulation-page/relulation-page.component';
import { FaqPageComponent } from './setting-page/faq-page/faq-page.component';
import { ExchangePageComponent } from './setting-page/exchange-page/exchange-page.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    MatTabsModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatCheckboxModule,
    ClipboardModule,
    DecodeVNPipe
  ],
  declarations: [MainPage, OrderPageComponent, OrderPageDetailComponent, PackagePageComponent, RechargePageComponent, ServicechargePageComponent, HomePageComponent, HistoryPageComponent, NotificationPageComponent,SettingPageComponent
  ,CreatePageComponent,DetailComponent,OrderStatusComponent,InfomationPageComponent,WithdrawPageComponent,ChangepasswordPageComponent,FormatdatePipe,ReportPageComponent,RelulationPageComponent,FaqPageComponent,ExchangePageComponent],
  providers:[NotificationServiceComponent,DatePipe,PreviousRouterServiceService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainPageModule { }
