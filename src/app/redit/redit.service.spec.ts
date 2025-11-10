import { TestBed } from '@angular/core/testing';

import { ReditService } from './redit.service';

describe('ReditService', () => {
  let service: ReditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
