import { Test, TestingModule } from '@nestjs/testing';
import { PlanillaService } from './planilla.service';
import { EntityManager } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Net_Usuario_Empresa } from 'src/modules/usuario/entities/net_usuario_empresa.entity';
import { MailService } from 'src/common/services/mail.service';

const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  });

describe('PlanillaService - generarPlanillaOrdinaria', () => {
  let service: PlanillaService;
  let entityManager: EntityManager;
  let jwtService: JwtService;
  let usuarioEmpRepository: Repository<Net_Usuario_Empresa>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        providers: [
            PlanillaService,
            {
              provide: EntityManager,
              useValue: { query: jest.fn() },
            },
            {
              provide: JwtService,
              useValue: {
                sign: jest.fn(() => 'mocked-jwt-token'),
                verify: jest.fn(() => ({ userId: 1 })),
              },
            },
            { provide: MailService, useValue: { sendEmail: jest.fn() } },
            { provide: 'net_personaRepository', useFactory: mockRepository },
            { provide: 'Net_Detalle_Pago_BeneficioRepository', useFactory: mockRepository },
            { provide: 'Net_TipoPlanillaRepository', useFactory: mockRepository },
            { provide: 'Net_Detalle_DeduccionRepository', useFactory: mockRepository },
          ]
          
    }).compile();

    service = module.get<PlanillaService>(PlanillaService);
    entityManager = module.get<EntityManager>(EntityManager);
    jwtService = module.get<JwtService>(JwtService);
    usuarioEmpRepository = module.get<Repository<Net_Usuario_Empresa>>('Net_Usuario_EmpresaRepository');
  });

  /**
   * ✅ Prueba: Ejecuta correctamente el procedimiento cuando todo está bien
   */
  it('debe ejecutar el procedimiento correctamente cuando hay planilla activa', async () => {
    const token = 'mocked-token';
    const tipos_persona = 'BENEFICIARIO,BENEFICIARIO SIN CAUSANTE';

    // Mock del usuario obtenido de la base de datos
    const usuarioMock = { id_usuario_empresa: 1 };
    usuarioEmpRepository.findOne = jest.fn().mockResolvedValue(usuarioMock);

    // Mock de la ejecución del procedimiento almacenado
    (entityManager.query as jest.Mock).mockResolvedValueOnce(undefined);

    await expect(service.generarPlanillaOrdinaria(token, tipos_persona)).resolves.toBeUndefined();

    // Verifica que se haya llamado correctamente con los valores esperados
    expect(entityManager.query).toHaveBeenCalledWith(
      expect.stringContaining('InsertarPlanillaOrdinaria'),
      [tipos_persona, usuarioMock.id_usuario_empresa]
    );
  });

  /**
   * ❌ Prueba: Falla si no hay una planilla activa para Beneficiarios
   */
  it('debe lanzar un error si no hay una planilla activa para Beneficiarios', async () => {
    const token = 'mocked-token';
    const tipos_persona = 'BENEFICIARIO,BENEFICIARIO SIN CAUSANTE';

    usuarioEmpRepository.findOne = jest.fn().mockResolvedValue({ id_usuario_empresa: 1 });

    // Simula un error del procedimiento almacenado
    (entityManager.query as jest.Mock).mockRejectedValue(new Error('No se encontró una planilla activa para Beneficiarios'));

    await expect(service.generarPlanillaOrdinaria(token, tipos_persona)).rejects.toThrow(
      new InternalServerErrorException('No se encontró una planilla activa para Beneficiarios')
    );
  });

  /**
   * ❌ Prueba: Falla si no hay una planilla activa para Jubilados
   */
  it('debe lanzar un error si no hay una planilla activa para Jubilados', async () => {
    const token = 'mocked-token';
    const tipos_persona = 'JUBILADO,PENSIONADO';

    usuarioEmpRepository.findOne = jest.fn().mockResolvedValue({ id_usuario_empresa: 1 });

    // Simula un error del procedimiento almacenado
    (entityManager.query as jest.Mock).mockRejectedValue(new Error('No se encontró una planilla activa para Jubilados'));

    await expect(service.generarPlanillaOrdinaria(token, tipos_persona)).rejects.toThrow(
      new InternalServerErrorException('No se encontró una planilla activa para Jubilados')
    );
  });

  /**
   * ❌ Prueba: Falla si ocurre un error desconocido
   */
  it('debe lanzar un error genérico si ocurre un error inesperado', async () => {
    const token = 'mocked-token';
    const tipos_persona = 'BENEFICIARIO,BENEFICIARIO SIN CAUSANTE';

    usuarioEmpRepository.findOne = jest.fn().mockResolvedValue({ id_usuario_empresa: 1 });

    // Simula un error desconocido del procedimiento almacenado
    (entityManager.query as jest.Mock).mockRejectedValue(new Error('Error inesperado en la BD'));

    await expect(service.generarPlanillaOrdinaria(token, tipos_persona)).rejects.toThrow(
      new InternalServerErrorException('Error ejecutando el procedimiento de planilla ordinaria')
    );
  });
});
