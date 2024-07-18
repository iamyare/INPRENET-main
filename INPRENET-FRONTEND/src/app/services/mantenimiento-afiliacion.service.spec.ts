import { TestBed } from '@angular/core/testing';

import { MantenimientoAfiliacionService } from './mantenimiento-afiliacion.service';

describe('MantenimientoAfiliacionService', () => {
  let service: MantenimientoAfiliacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoAfiliacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
