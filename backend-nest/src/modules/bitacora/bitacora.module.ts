import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Bitacora_Cambios } from './entities/net_bitacora_cambios.entity';
import { UserSession } from './entities/user_sessions.entity';
import { User } from './entities/user.entity';

@Module({
  providers: [],
  imports: [
    TypeOrmModule.forFeature([Net_Bitacora_Cambios, UserSession, User ])
  ],
    exports: [],
})
export class BitacoraModule {}
