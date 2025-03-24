import { Test, TestingModule } from '@nestjs/testing';
import { ConasaService } from './conasa.service';

describe('ConasaService', () => {
  let service: ConasaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConasaService],
    }).compile();

    service = module.get<ConasaService>(ConasaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
