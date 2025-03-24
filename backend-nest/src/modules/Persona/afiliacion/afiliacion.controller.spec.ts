import { Test, TestingModule } from '@nestjs/testing';
import { AfiliacionController } from './afiliacion.controller';

describe('AfiliacionController', () => {
  let controller: AfiliacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AfiliacionController],
    }).compile();

    controller = module.get<AfiliacionController>(AfiliacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
