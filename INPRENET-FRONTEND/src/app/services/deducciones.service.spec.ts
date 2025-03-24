import { TestBed } from '@angular/core/testing';

import { DeduccionesService } from './deducciones.service';

describe('DeduccionesService', () => {
  let service: DeduccionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeduccionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
