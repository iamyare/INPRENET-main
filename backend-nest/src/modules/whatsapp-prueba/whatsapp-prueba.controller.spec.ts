import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappPruebaController } from './whatsapp-prueba.controller';
import { WhatsappPruebaService } from './whatsapp-prueba.service';

describe('WhatsappPruebaController', () => {
  let controller: WhatsappPruebaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappPruebaController],
      providers: [WhatsappPruebaService],
    }).compile();

    controller = module.get<WhatsappPruebaController>(WhatsappPruebaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
