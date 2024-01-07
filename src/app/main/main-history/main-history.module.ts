import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainHistoryPageRoutingModule } from './main-history-routing.module';

import { MainHistoryPage } from './main-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainHistoryPageRoutingModule
  ],
  declarations: [MainHistoryPage]
})
export class MainHistoryPageModule {}
