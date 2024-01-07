import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainSettingPageRoutingModule } from './main-setting-routing.module';

import { MainSettingPage } from './main-setting.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainSettingPageRoutingModule
  ],
  declarations: [MainSettingPage]
})
export class MainSettingPageModule {}
