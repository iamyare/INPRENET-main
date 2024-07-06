import { TestBed } from '@angular/core/testing';

import { CentroTrabajoService } from './centro-trabajo.service';

describe('CentroTrabajoService', () => {
  let service: CentroTrabajoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentroTrabajoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
