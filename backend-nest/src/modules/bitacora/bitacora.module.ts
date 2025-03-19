import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Bitacora_Cambios } from './entities/net_bitacora_cambios.entity';

@Module({
  providers: [],
  imports: [
    TypeOrmModule.forFeature([Net_Bitacora_Cambios])
  ],
    exports: [],
})
export class BitacoraModule {}
