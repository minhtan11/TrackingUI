import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainNotificationPageRoutingModule } from './main-notification-routing.module';

import { MainNotificationPage } from './main-notification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainNotificationPageRoutingModule
  ],
  declarations: [MainNotificationPage]
})
export class MainNotificationPageModule {}
