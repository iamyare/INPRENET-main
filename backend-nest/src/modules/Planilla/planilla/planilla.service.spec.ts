import { Test, TestingModule } from '@nestjs/testing';
import { PlanillaService } from './planilla.service';
import { EntityManager } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

describe('PlanillaService - obtenerDetallePagoBeneficioPorPlanillaPrueba', () => {
  let service: PlanillaService;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanillaService,
        {
          provide: EntityManager,
          useValue: {
            query: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mocked-jwt-token'),
            verify: jest.fn(() => ({ userId: 1 })),
          },
        },
        { provide: MailService, useValue: { sendEmail: jest.fn() } },
        { provide: 'Net_PlanillaRepository', useFactory: mockRepository },
        { provide: 'net_personaRepository', useFactory: mockRepository },
        { provide: 'Net_Detalle_Pago_BeneficioRepository', useFactory: mockRepository },
        { provide: 'Net_TipoPlanillaRepository', useFactory: mockRepository },
        { provide: 'Net_Detalle_DeduccionRepository', useFactory: mockRepository },
        { provide: 'Net_Detalle_Beneficio_AfiliadoRepository', useFactory: mockRepository },
        { provide: 'Net_Usuario_EmpresaRepository', useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<PlanillaService>(PlanillaService);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  it('debe obtener detalles de pago con múltiples registros', async () => {
    const periodoInicio = '01-02-2025';
    const periodoFinalizacion = '28-02-2025';
    const idTiposPlanilla = [1, 2];

    // 🔥 Se agregan múltiples registros
    const beneficiosMock = [
      {
        codigo_banco: '40',
        numero_cuenta: '720889311',
        monto_a_pagar: 4450.68,
        nombre_completo: 'BARAHONA NAVARRO MARCIO MIGUEL',
        n_identificacion: '1501197701116',
        ID_PERSONA: 172518,
      },
      {
        codigo_banco: '41',
        numero_cuenta: '123456789',
        monto_a_pagar: 5000.00,
        nombre_completo: 'JUAN PÉREZ',
        n_identificacion: '0801199001234',
        ID_PERSONA: 172519,
      },
    ];

    const deduccionesInpremaMock = [
      { ID_PERSONA: 172518, deducciones_inprema: 4449.68 },
      { ID_PERSONA: 172519, deducciones_inprema: 1000.00 },
    ];

    const deduccionesTercerosMock = [
      { ID_PERSONA: 172518, deducciones_terceros: 0 },
      { ID_PERSONA: 172519, deducciones_terceros: 500.00 },
    ];

    // Simular respuestas de las consultas SQL
    (entityManager.query as jest.Mock)
      .mockResolvedValueOnce(beneficiosMock)
      .mockResolvedValueOnce(deduccionesInpremaMock)
      .mockResolvedValueOnce(deduccionesTercerosMock);

    const resultado = await service.obtenerDetallePagoBeneficioPorPlanillaPrueba(
      periodoInicio,
      periodoFinalizacion,
      idTiposPlanilla
    );

    // 🔥 Esperado con múltiples registros
    expect(resultado).toEqual([
      {
        codigo_banco: '40',
        numero_cuenta: '720889311',
        neto: 1, // 4450.68 - 4449.68 - 0
        nombre_completo: 'BARAHONA NAVARRO MARCIO MIGUEL',
        id_tipo_planilla: 1,
        n_identificacion: '1501197701116',
      },
      {
        codigo_banco: '41',
        numero_cuenta: '123456789',
        neto: 3500, // 5000 - 1000 - 500
        nombre_completo: 'JUAN PÉREZ',
        id_tipo_planilla: 4,
        n_identificacion: '0801199001234',
      },
    ]);

    expect(entityManager.query).toHaveBeenCalledTimes(3);
    expect(entityManager.query).toHaveBeenCalledWith(expect.any(String), [periodoInicio, periodoFinalizacion]);
  });


  it('debe manejar errores y lanzar InternalServerErrorException', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (entityManager.query as jest.Mock).mockRejectedValue(new Error('Database error'));
  
    await expect(
      service.obtenerDetallePagoBeneficioPorPlanillaPrueba('01-02-2025', '28-02-2025', [1,2])
    ).rejects.toThrow(InternalServerErrorException);
  
    expect(consoleSpy).toHaveBeenCalled(); // ✅ Verificar que se capturó el error
    consoleSpy.mockRestore();
  });
  
  
});
