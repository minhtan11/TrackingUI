import { TestBed } from '@angular/core/testing';

import { CheckTenantService } from './check-tenant.service';

describe('CheckTenantService', () => {
  let service: CheckTenantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckTenantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
