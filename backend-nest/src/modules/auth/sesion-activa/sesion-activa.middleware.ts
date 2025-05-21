import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { Sesion } from '../entities/sesion.entity'; // Adjusted path, assuming index.ts is not used here or direct path is preferred.

@Injectable()
export class SesionActivaMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Sesion)
    private readonly sesionRepository: Repository<Sesion>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader: string | undefined = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado.');
    }

    const sesion = await this.sesionRepository.findOne({
      where: { token: token, estado: 'activa' },
    });

    if (!sesion) {
      throw new UnauthorizedException('Sesión no válida o ya no está activa.');
    }

    next();
  }
}
