import { TestBed } from '@angular/core/testing';

import { ReditServiceService } from './redit.service.service';

describe('ReditServiceService', () => {
  let service: ReditServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReditServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
