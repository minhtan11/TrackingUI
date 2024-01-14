import { Injectable, OnInit, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../storage-service/storage.service';
import { HttpParams } from '@angular/common/http';
import { ApiserviceComponent } from '../apiservice/apiservice.component';

@Injectable({
  providedIn: 'root'
})
export class AuthguardGuard implements OnInit {
  constructor(
    private storage: StorageService,
    private api : ApiserviceComponent,
    private router : Router
  ){

  }
  ngOnInit(): void {
    
  }

  async canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot): Promise<boolean>{
    let oUser = await this.storage.get('oUser');
    if (oUser) {
      this.router.navigate(['main'], { queryParams: { oUser: oUser}});
      return false;
    }else{
      return true;
    }
  }
}
export const AuthGuard : CanActivateFn = (router : ActivatedRouteSnapshot,state : RouterStateSnapshot) :Promise<boolean> =>{
  return inject(AuthguardGuard).canActivate(router,state);
}
