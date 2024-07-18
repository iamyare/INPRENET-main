import { Test, TestingModule } from '@nestjs/testing';
import { MantenimientoAfiliacionService } from './mantenimiento-afiliacion.service';

describe('MantenimientoAfiliacionService', () => {
  let service: MantenimientoAfiliacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MantenimientoAfiliacionService],
    }).compile();

    service = module.get<MantenimientoAfiliacionService>(MantenimientoAfiliacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
