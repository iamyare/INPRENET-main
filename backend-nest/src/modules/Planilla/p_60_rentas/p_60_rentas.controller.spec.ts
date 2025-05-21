import { Test, TestingModule } from '@nestjs/testing';
import { P60RentasController } from './p_60_rentas.controller';
import { P60RentasService } from './p_60_rentas.service';

describe('P60RentasController', () => {
  let controller: P60RentasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [P60RentasController],
      providers: [P60RentasService],
    }).compile();

    controller = module.get<P60RentasController>(P60RentasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
