import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetSession } from './entities/net-session.entity';
import { SessionService } from './services/session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NetSession]), // Registra la entidad NetSession
  ],
  providers: [SessionService], // Declara el servicio
  exports: [SessionService], // Exporta el servicio para que otros módulos (como AuthModule) puedan usarlo
})
export class SessionModule {}
