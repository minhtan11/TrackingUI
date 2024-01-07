import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainHistoryPage } from './main-history.page';

const routes: Routes = [
  {
    path: '',
    component: MainHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainHistoryPageRoutingModule {}
