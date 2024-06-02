import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  constructor(private storage: Storage,private router : Router) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    await this.storage.create();
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public async set(key: string, value: any) {
    await this.storage.set(key, value);
  }

  // get methods that users of this service can
  // call, for example:
  public async get(key: string) {
    let value = await this.storage.get(key);
    return value;
  }

  public async remove(key: string) {
    await this.storage.remove(key);
  }

  public async setAccount(username:any) {
    let sUser = username.trim();
    let lstUser = await this.storage.get('lstUser');
    if (lstUser == '' || lstUser == null) {
      lstUser += sUser;
      this.storage.set('lstUser', lstUser);
    }else{
      let array = lstUser.split(';');
      if (!array.includes(sUser)) {
        lstUser += `;${sUser}`;
        this.storage.set('lstUser', lstUser);
      }
    }
  }
}
