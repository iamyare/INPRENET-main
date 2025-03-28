import { Test, TestingModule } from '@nestjs/testing';
import { RnpService } from './rnp.service';

describe('RnpService', () => {
  let service: RnpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RnpService],
    }).compile();

    service = module.get<RnpService>(RnpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
