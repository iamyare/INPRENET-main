import { TestBed } from '@angular/core/testing';

import { DatosEstaticosService } from './datos-estaticos.service';

describe('DatosEstaticosService', () => {
  let service: DatosEstaticosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatosEstaticosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
