import { TestBed } from '@angular/core/testing';

import { PreviousRouterServiceService } from './previous-router-service.service';

describe('PreviousRouterServiceService', () => {
  let service: PreviousRouterServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviousRouterServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
