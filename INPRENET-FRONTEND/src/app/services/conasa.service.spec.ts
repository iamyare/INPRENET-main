import { TestBed } from '@angular/core/testing';

import { ConasaService } from './conasa.service';

describe('ConasaService', () => {
  let service: ConasaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConasaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
