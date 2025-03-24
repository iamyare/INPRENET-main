import { Test, TestingModule } from '@nestjs/testing';
import { EscalafonController } from './escalafon.controller';
import { EscalafonService } from './escalafon.service';

describe('EscalafonController', () => {
  let controller: EscalafonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EscalafonController],
      providers: [EscalafonService],
    }).compile();

    controller = module.get<EscalafonController>(EscalafonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
