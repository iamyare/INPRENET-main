import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Net_Session } from './entities/net-session.entity';
import { SessionService } from './services/session.service';
import { SseController } from './controllers/sse.controller';
import { SseService } from './services/sse.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Net_Session]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [SessionService, SseService],
  controllers: [SseController],
  exports: [SessionService, SseService],
})
export class SessionModule {}
