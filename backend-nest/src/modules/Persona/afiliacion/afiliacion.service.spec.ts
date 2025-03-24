import { Test, TestingModule } from '@nestjs/testing';
import { AfiliacionService } from './afiliacion.service';

describe('AfiliacionService', () => {
  let service: AfiliacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AfiliacionService],
    }).compile();

    service = module.get<AfiliacionService>(AfiliacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
