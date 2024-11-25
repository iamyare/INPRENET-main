import { TestBed } from '@angular/core/testing';

import { CentroEducativoService } from './centro-educativo.service';

describe('CentroEducativoService', () => {
  let service: CentroEducativoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentroEducativoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
