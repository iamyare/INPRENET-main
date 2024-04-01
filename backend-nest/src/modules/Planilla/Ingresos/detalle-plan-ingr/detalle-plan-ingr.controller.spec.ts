import { Test, TestingModule } from '@nestjs/testing';
import { DetallePlanIngrController } from './detalle-plan-ingr.controller';

describe('DetallePlanIngrController', () => {
  let controller: DetallePlanIngrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetallePlanIngrController],
    }).compile();

    controller = module.get<DetallePlanIngrController>(DetallePlanIngrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
