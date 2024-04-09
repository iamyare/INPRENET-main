import { Test, TestingModule } from '@nestjs/testing';
import { DetallePlanIngrController } from './detalle-plan-ingr.controller';
import { DetallePlanillaIngresoService } from './detalle-planilla-ing.service';

describe('DetallePlanIngrController', () => {
  let controller: DetallePlanIngrController;

  const mockDetPlanIngServ = {
    buscarPorMesAct: jest.fn((dto) => {
      console.log(dto);

      return {
      }
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetallePlanIngrController],
      providers: [DetallePlanillaIngresoService]
    })
      .overrideProvider(DetallePlanillaIngresoService)
      .useValue(mockDetPlanIngServ)
      .compile();

    controller = module.get<DetallePlanIngrController>(DetallePlanIngrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should buscarPorMesYDni', async () => {
    const result = await controller.buscarPorMesYDni(6);
    console.log(result);

    expect(result).toEqual(
      {}
    );
  });

});