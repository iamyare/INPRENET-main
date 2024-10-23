import { Test, TestingModule } from '@nestjs/testing';
import { EscalafonService } from './escalafon.service';

describe('EscalafonService', () => {
  let service: EscalafonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EscalafonService],
    }).compile();

    service = module.get<EscalafonService>(EscalafonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
