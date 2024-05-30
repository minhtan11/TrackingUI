import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, Router } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule, Storage } from '@ionic/storage-angular';
import { ApiserviceComponent } from './apiservice/apiservice.component';
import { AuthguardGuard } from './authguardservice/authguard.guard';
import { StorageService } from './storage-service/storage.service';
import { NotificationServiceComponent } from './notification-service/notification-service.component';
import { FcmService } from './services-fcm/fcm.service';
import { PreviousRouterServiceService } from './previous-router-service/previous-router-service.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot({mode:'ios',innerHTMLTemplatesEnabled:true}), AppRoutingModule, BrowserAnimationsModule,HttpClientModule,IonicStorageModule,IonicStorageModule.forRoot()],
  providers: [
    ApiserviceComponent,
    AuthguardGuard,
    StorageService,
    NotificationServiceComponent,
    FcmService,
    PreviousRouterServiceService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {
}
