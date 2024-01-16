import { APP_INITIALIZER, NgModule } from '@angular/core';
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
import { CheckTenantService } from './check-tenant/check-tenant.service';

function appInitializer(checkService: CheckTenantService) {
  return () => {
    return new Promise((resolve) => {
      checkService.init();
      resolve(true);
    });
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, BrowserAnimationsModule,HttpClientModule,IonicStorageModule,IonicStorageModule.forRoot()],
  providers: [
    ApiserviceComponent,
    AuthguardGuard,
    StorageService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [CheckTenantService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
