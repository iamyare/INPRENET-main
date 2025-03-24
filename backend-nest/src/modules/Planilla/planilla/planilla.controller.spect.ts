import { Test, TestingModule } from '@nestjs/testing';
import { PlanillaService } from './planilla.service';
import { EntityManager } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

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

describe('calculoPrioridadMontoAplicado', () => {
    let service: PlanillaService;
    let entityManager: EntityManager;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlanillaService,
                {
                    provide: EntityManager,
                    useValue: {
                        query: jest.fn(), // Usamos jest.fn() para mockear la función 'query'
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(() => 'mocked-jwt-token'),
                        verify: jest.fn(() => ({ userId: 1 })),
                    },
                },
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

    it('Debe calcular correctamente los montos aplicados', async () => {
        const idPlanilla = 255;

        // Simular la respuesta de las consultas SQL
        (entityManager.query as jest.Mock).mockImplementation(async (query: string, params: any[]) => {
            if (query.includes('SUM(detBs."MONTO_A_PAGAR")')) {
                return [{ ID_PERSONA: 1, N_IDENTIFICACION: '123456789', TOTAL_BENEFICIOS: 1000 }];
            } else if (query.includes('SUM(dd."MONTO_TOTAL")')) {
                return [{ ID_PERSONA: 1, TOTAL_DEDUCCIONES: 500 }];
            } else if (query.includes('FROM net_detalle_deduccion')) {
                return [{ ID_PERSONA: 1, ID_DED_DEDUCCION: 99, MONTO_TOTAL: 500 }];
            } else if (query.includes('FROM NET_DEDUCCION')) {
                return [{ ID_DEDUCCION: 10, PRIORIDAD: 1 }];
            }
            return [];
        });

        // Ejecutar la función
        const result = await service.calculoPrioridadMontoAplicado(idPlanilla);

        // Verificar que los cálculos sean correctos
        expect(result).toEqual([
            {
                ID_PERSONA: 1,
                ID_DED_DEDUCCION: 99,
                MONTO_APLICADO: 500,
            },
        ]);

        // Verificar que se ejecutaron las actualizaciones correctas
        expect(entityManager.query).toHaveBeenCalledWith(
            `UPDATE NET_DETALLE_DEDUCCION
       SET MONTO_APLICADO = :montoAplicado
       WHERE ID_DED_DEDUCCION = :idDedDeduccion`,
            [500, 99]
        );
    });
});
