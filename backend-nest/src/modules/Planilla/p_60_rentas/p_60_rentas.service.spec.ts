import { Test, TestingModule } from '@nestjs/testing';
import { P60RentasService } from './p_60_rentas.service';

describe('P60RentasService', () => {
  let service: P60RentasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [P60RentasService],
    }).compile();

    service = module.get<P60RentasService>(P60RentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
