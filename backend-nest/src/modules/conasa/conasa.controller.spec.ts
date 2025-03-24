import { Test, TestingModule } from '@nestjs/testing';
import { ConasaController } from './conasa.controller';
import { ConasaService } from './conasa.service';

describe('ConasaController', () => {
  let controller: ConasaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConasaController],
      providers: [ConasaService],
    }).compile();

    controller = module.get<ConasaController>(ConasaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
