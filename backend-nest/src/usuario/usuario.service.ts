import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { Empleado } from 'src/empresas/entities/empleado.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/common/services/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {

  private readonly logger = new Logger(UsuarioService.name)

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ){}

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const usuario = this.usuarioRepository.create(createUsuarioDto);
      await this.usuarioRepository.save(usuario);

      const empleadoData = { ...createUsuarioDto, usuario: usuario };
      const empleado = this.empleadoRepository.create(empleadoData);

      await this.empleadoRepository.save(empleado);

      const payload = { username: usuario.correo, nombre: usuario.nombre };
      const token = this.jwtService.sign(payload);
      
      const enlace = `http://localhost:4200/#/register/${token}`;
      const mailContent = {
        to: usuario.correo, 
        subject: 'Bienvenido a Nuestra Aplicación', 
        text: `Hola ${usuario.nombre}, bienvenido a nuestra aplicación.`, 
        html: `<!DOCTYPE html>
        <html lang="es">
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    border: 1px solid #ddd;
                    padding: 20px;
                }
                .email-header img {
                    max-width: 100%;
                    height: auto;
                }
                .email-content h2 {
                    color: #333;
                }
                .email-content p {
                    font-size: 16px;
                }
                .email-button {
                    display: inline-block;
                    padding: 10px 20px;
                    margin-top: 20px;
                    background-color: #007bff;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .email-footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <img src="https://cdn.pixabay.com/photo/2023/12/09/19/36/present-8440034_1280.jpg" alt="SYSJUB">
                </div>
                <div class="email-content">
                    <h2>Hola ${usuario.nombre}</h2>
                    <p>Haz clic en el siguiente enlace para actualizar tus datos:</p>
                    <a href="${enlace}" class="email-button">Actualizar Datos</a>
                </div>
                <div class="email-footer">
                    <p>Este es un mensaje automático, por favor no responder.</p>
                </div>
            </div>
        </body>
        </html>`
      };
      await this.mailService.sendMail(mailContent.to, mailContent.subject, mailContent.text, mailContent.html);

      
      return { usuario, empleado };
  } catch (error) {
      this.handleException(error);
  }
}

  findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto
    return this.usuarioRepository.find({
      take: limit,
      skip : offset
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  async update(updateUsuarioDto: UpdateUsuarioDto) {
    const { token, contrasena, ...rest } = updateUsuarioDto;

    if (!contrasena) {
      throw new BadRequestException('La contraseña es requerida');
    }

    let decoded;
    try {
      decoded = this.jwtService.verify(token);
    } catch (error) {
      throw new BadRequestException('Token inválido');
    }

    const { correo, id_usuario } = decoded;
    const usuario = await this.usuarioRepository.findOne({ where: { correo, id_usuario } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.estado = 'ACTIVO';
    usuario.contrasena = await bcrypt.hash(contrasena, 10);
    Object.assign(usuario, rest); 

    try {
      await this.usuarioRepository.save(usuario);
      return { success: true, msg: 'Usuario confirmado y seguridad actualizada' };
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar la información de seguridad del usuario');
    }
  }


  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('El Correo o Numero de ID ya esta registrado');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
