import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappPruebaService } from './whatsapp-prueba.service';

describe('WhatsappPruebaService', () => {
  let service: WhatsappPruebaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsappPruebaService],
    }).compile();

    service = module.get<WhatsappPruebaService>(WhatsappPruebaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
