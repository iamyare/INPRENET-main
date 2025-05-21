import { Test, TestingModule } from '@nestjs/testing';
import { RnpController } from './rnp.controller';
import { RnpService } from './rnp.service';

describe('RnpController', () => {
  let controller: RnpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RnpController],
      providers: [RnpService],
    }).compile();

    controller = module.get<RnpController>(RnpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
