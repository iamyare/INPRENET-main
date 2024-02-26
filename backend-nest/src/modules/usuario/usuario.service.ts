import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Net_Usuario } from './entities/net_usuario.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/common/services/mail.service';
import * as bcrypt from 'bcrypt';
import { Empleado } from 'src/modules/Empresarial/empresas/entities/empleado.entity';
import { Net_Rol } from './entities/net_rol.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Net_TipoIdentificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';

@Injectable()
export class UsuarioService {

  private readonly logger = new Logger(UsuarioService.name)

  constructor(
    @InjectRepository(Net_Usuario)
    private readonly usuarioRepository: Repository<Net_Usuario>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(Net_Rol)
    private readonly rolRepository: Repository<Net_Rol>,
    @InjectRepository(Net_TipoIdentificacion)
    private readonly tipoIdentificacionRepository: Repository<Net_TipoIdentificacion>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ){}

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {

      const rol = await this.rolRepository.findOneBy({ nombre_rol: createUsuarioDto.nombre_rol });
        if (!rol) {
            throw new BadRequestException('Rol not found');
        }
  
      const usuario = this.usuarioRepository.create({...createUsuarioDto, rol});
      await this.usuarioRepository.save(usuario);

      const tipo_identificacion = await this.tipoIdentificacionRepository.findOneBy({ tipo_identificacion: createUsuarioDto.tipo_identificacion });
        if (!tipo_identificacion) {
            throw new BadRequestException('Tipo identificacion not found');
        }

      const empleadoData = { ...createUsuarioDto, usuario: usuario};
      const empleado = this.empleadoRepository.create({...empleadoData, tipo_identificacion});
      

      await this.empleadoRepository.save(empleado);

      const payload = { username: usuario.correo, nombre: empleadoData.nombre_empleado, rol: usuario.rol };
      const token = this.jwtService.sign(payload);
      
      const enlace = `http://localhost:4200/#/register/${token}`;
      const mailContent = {
        to: usuario.correo, 
        subject: 'Bienvenido a Nuestra Aplicación', 
        text: `Hola ${empleadoData.nombre_empleado}, bienvenido a nuestra aplicación.`, 
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
                    <h2>Hola ${empleadoData.nombre_empleado}</h2>
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

      
      return { empleado };
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
    const { token, contrasena, nombre_puesto, telefono_empleado, numero_empleado, ...restUsuario } = updateUsuarioDto;

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
    const usuario = await this.usuarioRepository.findOne({
      where: { correo, id_usuario },
      relations: ['empleado']
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.contrasena = await bcrypt.hash(contrasena, 10);
    Object.assign(usuario, restUsuario); // Actualiza propiedades del usuario
    usuario.estado = 'ACTIVO'; // o cualquier otro cambio necesario

    // Actualizar datos del usuario
    await this.usuarioRepository.save(usuario);

    // Verificar y actualizar el empleado relacionado
    if (usuario.empleado) {
      usuario.empleado.nombre_puesto = nombre_puesto; 
      usuario.empleado.telefono_empleado = telefono_empleado;
      usuario.empleado.numero_empleado = numero_empleado; // Agrega aquí más actualizaciones de empleado si son necesarias
      await this.empleadoRepository.save(usuario.empleado);
    } else {
      throw new NotFoundException('Empleado asociado no encontrado');
    }

    return { success: true, msg: 'Usuario y empleado actualizados correctamente' };
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
