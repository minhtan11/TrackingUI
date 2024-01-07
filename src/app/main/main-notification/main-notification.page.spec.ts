import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainNotificationPage } from './main-notification.page';

describe('MainNotificationPage', () => {
  let component: MainNotificationPage;
  let fixture: ComponentFixture<MainNotificationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MainNotificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
