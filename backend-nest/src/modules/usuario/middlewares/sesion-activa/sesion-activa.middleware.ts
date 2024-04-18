import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NET_SESION } from '../../entities/net_sesion.entity';
import { Repository } from 'typeorm';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SesionActivaMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(NET_SESION)
    private sesionRepository: Repository<NET_SESION>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader: string | undefined = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado.');
    }

    const sesion = await this.sesionRepository.findOne({
      where: { token, estado: 'activa' },
    });

    if (!sesion) {
      throw new UnauthorizedException('Sesión no válida o cerrada.');
    }

    next();
  }
}
