import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainSettingPage } from './main-setting.page';

const routes: Routes = [
  {
    path: '',
    component: MainSettingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainSettingPageRoutingModule {}
