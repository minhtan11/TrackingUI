import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { NavController } from '@ionic/angular';
import { ApiserviceComponent } from 'src/app/apiservice/apiservice.component';
import { NotificationServiceComponent } from 'src/app/notification-service/notification-service.component';
import { StorageService } from 'src/app/storage-service/storage.service';

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportPageComponent  implements OnInit {
  isHideFooter:any=false;
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiserviceComponent,
    private rt: ActivatedRoute,
    private notification: NotificationServiceComponent,
    private navCtrl: NavController,
    private storage: StorageService,
    private formBuilder: FormBuilder,
  ) { 
  }

  ngOnInit() {}

  async ngAfterViewInit() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.isHideFooter = true;
      this.dt.detectChanges();
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.isHideFooter = false;
      this.dt.detectChanges();
    });
  }

  onback(){
    this.navCtrl.navigateBack('main');
  }

  onReport(){

  }

}
