import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainHistoryPage } from './main-history.page';

describe('MainHistoryPage', () => {
  let component: MainHistoryPage;
  let fixture: ComponentFixture<MainHistoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MainHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
