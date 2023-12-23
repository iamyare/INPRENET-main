import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { EmpleadoEmpresa } from './entities/empleado-empresa.entity';
import { Empleado } from './entities/empleado.entity';
import { CentroTrabajo } from '../centro-trabajo/entities/centro-trabajo.entity';

@Module({
  controllers: [EmpresasController],
  providers: [EmpresasService],
  imports: [
    TypeOrmModule.forFeature([Empresa,Empleado,EmpleadoEmpresa,CentroTrabajo])
  ]
})
export class EmpresasModule {}
