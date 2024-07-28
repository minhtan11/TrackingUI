import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { SignUpComponent } from './sign-up/sign-up/sign-up.component';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { ApiserviceComponent } from '../apiservice/apiservice.component';
import { HttpClientModule } from '@angular/common/http';
import { NotificationServiceComponent } from '../notification-service/notification-service.component';
import {MatSelectModule} from '@angular/material/select';
import { DecodeVNPipe } from '../pipe/decode-VN/decode-vn.pipe';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    HttpClientModule, 
    DecodeVNPipe
  ],
  declarations: [HomePage,SignUpComponent,ForgotPasswordComponent,ResetPasswordComponent],
  providers: [
    ApiserviceComponent,
    NotificationServiceComponent,
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
  ]
})
export class HomePageModule {}
