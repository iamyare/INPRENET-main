import { TestBed } from '@angular/core/testing';

import { InstitucionesService } from './instituciones.service';

describe('InstitucionesService', () => {
  let service: InstitucionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstitucionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
