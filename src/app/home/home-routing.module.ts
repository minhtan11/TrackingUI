import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { SignUpComponent } from './sign-up/sign-up/sign-up.component';
import { NotificationPageComponent } from '../main/notification-page/notification-page.component';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'signup',
    component: SignUpComponent,
  },
  {
    path: 'notification',
    component: NotificationPageComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
