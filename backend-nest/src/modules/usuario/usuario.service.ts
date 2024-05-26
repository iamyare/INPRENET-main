import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Not, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/common/services/mail.service';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Net_TipoIdentificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { NET_USUARIO_PRIVADA } from './entities/net_usuario_privada.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { NET_SESION } from './entities/net_sesion.entity';
import { CreatePreRegistroDto } from './dto/create-pre-registro.dto';
import { Net_Usuario_Empresa } from './entities/net_usuario_empresa.entity';
import { Net_Empleado } from '../Empresarial/entities/net_empleado.entity';
import { Net_Rol_Empresa } from './entities/net_rol_empresa.entity';
import { Net_Seguridad } from './entities/net_seguridad.entity';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { LoginDto } from './dto/login.dto';
import { Net_Empresa } from '../Empresarial/entities/net_empresa.entity';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name)

  constructor(

    @InjectRepository(Net_Usuario_Empresa)
    private readonly usuarioRepository: Repository<Net_Usuario_Empresa>,
    @InjectRepository(NET_USUARIO_PRIVADA)
    private readonly usuarioPrivadaRepository: Repository<NET_USUARIO_PRIVADA>,
    @InjectRepository(Net_Empleado)
    private readonly empleadoRepository: Repository<Net_Empleado>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(NET_SESION)
    private readonly sesionRepository: Repository<NET_SESION>,
    @InjectRepository(Net_Usuario_Empresa)
    private readonly usuarioEmpresaRepository: Repository<Net_Usuario_Empresa>,
    @InjectRepository(Net_Rol_Empresa)
    private readonly rolEmpresaRepository: Repository<Net_Rol_Empresa>,
    @InjectRepository(Net_Seguridad)
    private readonly seguridadRepository: Repository<Net_Seguridad>,
    @InjectRepository(Net_Empresa)
    private readonly empresaRepository: Repository<Net_Empresa>
  ) { }

  async preRegistro(createPreRegistroDto: CreatePreRegistroDto): Promise<void> {
    const { nombreEmpleado, nombrePuesto, correo, numeroEmpleado, idRole } = createPreRegistroDto;

    // Verificar si el usuario ya existe
    const usuarioExistente = await this.usuarioEmpresaRepository.findOne({ where: { correo } });
    if (usuarioExistente) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Verificar si el rol existe
    const rol = await this.rolEmpresaRepository.findOne({ where: { id_rol_empresa: idRole } });
    if (!rol) {
      throw new BadRequestException('El rol especificado no existe');
    }

    // Crear un nuevo empleado
    const nuevoEmpleado = this.empleadoRepository.create({
      nombreEmpleado,
    });

    const empleado = await this.empleadoRepository.save(nuevoEmpleado);
    const nuevoUsuario = this.usuarioEmpresaRepository.create({
      nombrePuesto,
      numeroEmpleado,
      estado: 'PENDIENTE',
      correo,
      contrasena: await bcrypt.hash('temporal', 10),
      role: rol,
      user: empleado,
    });

    await this.usuarioEmpresaRepository.save(nuevoUsuario);

    // Generar un token JWT para la verificación de correo
    const token = this.jwtService.sign({ correo });

    // Enviar correo electrónico de verificación
    const verificationUrl = `http://localhost:4200/#/register?token=${token}`;
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2 style="color: #13776B;">¡Bienvenido a INPRENET!</h2>
    <p>Hola ${nombreEmpleado},</p>
    <p>Estamos encantados de tenerte con nosotros y queremos asegurarnos de que tengas la mejor experiencia posible desde el primer día.</p>
    <div style="text-align: center;">
      <img src="https://southcentralus1-mediap.svc.ms/transform/thumbnail?provider=spo&inputFormat=svg&cs=fFNQTw&docid=https%3A%2F%2Finpremagob-my.sharepoint.com%3A443%2F_api%2Fv2.0%2Fdrives%2Fb!SI5LDUe5UUeWwbh8d22jHOuRtzUPu3pFjDQjpEOapGryqRMSooSMRZ-wwIb8wBJs%2Fitems%2F01UGOONEU5HH7KZBUIZVEJ72CI6THKKM2V%3Fversion%3DPublished&access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvaW5wcmVtYWdvYi1teS5zaGFyZXBvaW50LmNvbUBkMjI2NmE3Mi1jNDBkLTRkZTMtOWQ1Zi1kMmZmYmYzMDQ5YmQiLCJjYWNoZWtleSI6IjBoLmZ8bWVtYmVyc2hpcHx1cm4lM2FzcG8lM2Fhbm9uI2Q5ZDAwMjIxOGUwNjE3YTUyNTYwMWE3ZjIzMjE5YWViMzUyMjNmN2U3YmI5ZDNlMTU3YTc3YzFlYzFkMzJhNzgiLCJlbmRwb2ludHVybCI6ImsxRWtyL2tDL3pSMjg0cG9JM24wRUY5UWM0b2ZZQ3NYMUJSUlB1aStBL0U9IiwiZW5kcG9pbnR1cmxMZW5ndGgiOiIxMjAiLCJleHAiOiIxNzE2NzY4MDAwIiwiaXBhZGRyIjoiMTkwLjkyLjg3LjMiLCJpc2xvb3BiYWNrIjoiVHJ1ZSIsImlzcyI6IjAwMDAwMDAzLTAwMDAtMGZmMS1jZTAwLTAwMDAwMDAwMDAwMCIsImlzdXNlciI6InRydWUiLCJuYW1laWQiOiIwIy5mfG1lbWJlcnNoaXB8dXJuJTNhc3BvJTNhYW5vbiNkOWQwMDIyMThlMDYxN2E1MjU2MDFhN2YyMzIxOWFlYjM1MjIzZjdlN2JiOWQzZTE1N2E3N2MxZWMxZDMyYTc4IiwibmJmIjoiMTcxNjc0NjQwMCIsIm5paSI6Im1pY3Jvc29mdC5zaGFyZXBvaW50Iiwic2hhcmluZ2lkIjoiM1ZqUkduNXpza0t2ZFI5aVcrdUljQSIsInNpdGVpZCI6Ik1HUTBZamhsTkRndFlqazBOeTAwTnpVeExUazJZekV0WWpnM1l6YzNObVJoTXpGaiIsInNuaWQiOiI2Iiwic3RwIjoidCIsInR0IjoiMCIsInZlciI6Imhhc2hlZHByb29mdG9rZW4ifQ.v0PlebLrI6p6-du_YxzdVl-8U3MvWL3hf4CDJv-mQLw&cTag=%22c%3A%7BACFE399D-8886-48CD-9FE8-48F4CEA53355%7D%2C1%22&encodeFailures=1&width=459&height=270&srcWidth=&srcHeight=&cropMode=dochead" alt="Imagen del Sistema" style="width: 80%; max-width: 600px; border-radius: 8px; margin: 20px 0;">
    </div>
    <p>Para empezar, necesitamos que completes tu registro. Esto nos ayudará a personalizar tu experiencia y asegurarnos de que tienes acceso a todas las funcionalidades de nuestra aplicación.</p>
    <p>Por favor, completa tu registro haciendo clic en el siguiente enlace:</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${verificationUrl}" style="background-color: #13776B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Completar Registro</a>
    </div>
    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
    <p>¡Gracias por unirte a nosotros!</p>
    <p>El equipo de INPRENET</p>
  </div>`;

    await this.mailService.sendMail(correo, 'Completa tu registro', '', htmlContent);
  }

  async completarRegistro(token: string, completeRegistrationDto: CompleteRegistrationDto, archivo_identificacion: Buffer): Promise<void> {
    const { correo, contrasena, pregunta_de_usuario_1, respuesta_de_usuario_1, pregunta_de_usuario_2, respuesta_de_usuario_2, pregunta_de_usuario_3, respuesta_de_usuario_3, telefonoEmpleado, numero_identificacion } = completeRegistrationDto;

    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.correo !== correo) {
        throw new BadRequestException('El correo no coincide');
      }
    } catch (error) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const usuario = await this.usuarioEmpresaRepository.findOne({ where: { correo, estado: 'PENDIENTE' }, relations: ['user'] });
    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado o ya registrado');
    }

    usuario.contrasena = await bcrypt.hash(contrasena, 10);
    usuario.estado = 'ACTIVO';
    usuario.fecha_verificacion = new Date();
    usuario.user.telefonoEmpleado = telefonoEmpleado;
    usuario.user.numero_identificacion = numero_identificacion;
    usuario.user.archivo_identificacion = archivo_identificacion;

    await this.empleadoRepository.save(usuario.user);
    await this.usuarioEmpresaRepository.save(usuario);

    // Crear registros de seguridad
    const seguridad1 = this.seguridadRepository.create({
      pregunta: pregunta_de_usuario_1,
      respuesta: respuesta_de_usuario_1,
      usuarioEmpresa: usuario,
    });

    const seguridad2 = this.seguridadRepository.create({
      pregunta: pregunta_de_usuario_2,
      respuesta: respuesta_de_usuario_2,
      usuarioEmpresa: usuario,
    });

    const seguridad3 = this.seguridadRepository.create({
      pregunta: pregunta_de_usuario_3,
      respuesta: respuesta_de_usuario_3,
      usuarioEmpresa: usuario,
    });

    await this.seguridadRepository.save([seguridad1, seguridad2, seguridad3]);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { correo, contrasena } = loginDto;

    const usuario = await this.usuarioEmpresaRepository.findOne({
      where: { correo },
      relations: ['role', 'role.empresa']
    });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      correo,
      sub: usuario.id_usuario_empresa,
      rol: usuario.role.nombre_rol,
      idEmpresa: usuario.role.empresa.id_empresa
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async getRolesPorEmpresa(empresaId: number) {
    return this.rolEmpresaRepository.find({
      where: { empresa: { id_empresa: empresaId }, nombre_rol: Not('ADMINISTRADOR') },
    });
  }

  
  async verificarEstadoSesion(token: string): Promise<{ sesionActiva: boolean }> {
    const sesion = await this.sesionRepository.findOne({
        where: { token },
        select: ['estado']
    });

    if (!sesion || sesion.estado !== 'activa') {
        return { sesionActiva: false };
    }

    return { sesionActiva: true };
}

  async cerrarSesion(token: string): Promise<void> {
    const sesion = await this.sesionRepository.findOne({
        where: {
            token,
            estado: 'activa',
        },
    });

    if (!sesion) {
        throw new NotFoundException('Sesión no encontrada.');
    }

    sesion.estado = 'cerrada';
    await this.sesionRepository.save(sesion);
}


  async loginPrivada(email: string, contrasena: string): Promise<any> {
    
    const usuario = await this.usuarioPrivadaRepository.findOne({
      where: { email },
      relations: ['centroTrabajo'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const passwordValid = await bcrypt.compare(contrasena, usuario.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = { 
      sub: usuario.id_usuario, 
      email: usuario.email,
      ...(usuario.centroTrabajo && { idCentroTrabajo: usuario.centroTrabajo.id_centro_trabajo }),
    };
    const token = this.jwtService.sign(payload);

    const nuevaSesion = new NET_SESION();
    nuevaSesion.usuarioPrivada = usuario;
    nuevaSesion.token = token;
    nuevaSesion.fecha_creacion = new Date();
    nuevaSesion.fecha_expiracion = new Date(Date.now() + 1000 * 60 * 60 * 24);
    nuevaSesion.estado = 'activa';

    await this.sesionRepository.save(nuevaSesion);

    return {
      access_token: token,
    };
  }
  
  async createPrivada(email: string, contrasena: string, nombre_usuario: string, idCentroTrabajo?: number) {
    /* const usuarioExistente = await this.usuarioPrivadaRepository.findOne({ where: { email } });
    if (usuarioExistente) {
      throw new BadRequestException('El correo electrónico ya está en uso.');
    }
  
    const rolPrivados = await this.rolRepository.findOneBy({ id_rol: 1 });
    if (!rolPrivados) {
      throw new BadRequestException('El rol "PRIVADOS" no existe.');
    }
  
    const hashedPassword = await bcrypt.hash(contrasena, 10);
  
    const nuevoUsuario = new NET_USUARIO_PRIVADA();
    nuevoUsuario.email = email;
    nuevoUsuario.passwordHash = hashedPassword;
    nuevoUsuario.nombre_usuario = nombre_usuario;
    nuevoUsuario.rol = rolPrivados;
  
    if (idCentroTrabajo) {
      const centroTrabajo = await this.centroTrabajoRepository.findOneBy({ id_centro_trabajo: idCentroTrabajo });
      if (!centroTrabajo) {
        throw new BadRequestException('El centro de trabajo proporcionado no existe.');
      }
      nuevoUsuario.centroTrabajo = centroTrabajo;
    }
  
    return this.usuarioPrivadaRepository.save(nuevoUsuario); */
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    /* const queryRunner = this.usuarioRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Verificar que el correo no esté registrado
      console.log('Verificando si el correo ya está registrado...');
      const usuarioExistente = await queryRunner.manager.findOne(Net_Usuario, { where: { correo: createUsuarioDto.correo } });
      if (usuarioExistente) {
        console.log('Correo ya registrado:', usuarioExistente);
        throw new BadRequestException('El correo ya está registrado');
      }
  
      // Verificar que el número de identificación no esté registrado
      console.log('Verificando si el número de identificación ya está registrado...');
      const empleadoExistente = await queryRunner.manager.findOne(Net_Empleado, { where: { numero_identificacion: createUsuarioDto.numero_identificacion } });
      if (empleadoExistente) {
        console.log('Número de identificación ya registrado:', empleadoExistente);
        throw new BadRequestException('El número de identificación ya está registrado');
      }
  
      // Buscar rol
      console.log('Buscando rol...');
      const rol = await queryRunner.manager.findOne(Net_Rol, { where: { nombre_rol: createUsuarioDto.nombre_rol } });
      if (!rol) {
        throw new BadRequestException('Rol not found');
      }
  
      // Crear usuario
      console.log('Creando usuario...');
      const usuario = this.usuarioRepository.create({ ...createUsuarioDto, rol });
      await queryRunner.manager.save(usuario);
  
      // Buscar tipo de identificación
      console.log('Buscando tipo de identificación...');
      const tipo_identificacion = await queryRunner.manager.findOne(Net_TipoIdentificacion, { where: { tipo_identificacion: createUsuarioDto.tipo_identificacion } });
      if (!tipo_identificacion) {
        throw new BadRequestException('Tipo identificacion not found');
      }
  
      // Crear empleado
      const empleadoData = {
        ...createUsuarioDto,
        usuario,
        tipo_identificacion,
        archivo_identificacion: createUsuarioDto.archivo_identificacion?.buffer,
      };
      console.log('Creando empleado...');
      const empleado = this.empleadoRepository.create(empleadoData);
      await queryRunner.manager.save(empleado);
  
      // Confirmar la transacción
      await queryRunner.commitTransaction();
  
      // Generar token y enviar email
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
      await queryRunner.rollbackTransaction();
      this.handleException(error);
    } finally {
      await queryRunner.release();
    } */
  }
  
  
  

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto
    return this.usuarioRepository.find({
      take: limit,
      skip: offset
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  async update(updateUsuarioDto: UpdateUsuarioDto) {
   /*  const { token, contrasena, nombre_puesto, telefono_empleado, numero_empleado, ...restUsuario } = updateUsuarioDto;

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
    usuario.estado = 'ACTIVO';
    usuario.fecha_verificacion = new Date();

    // Actualizar datos del usuario
    await this.usuarioRepository.save(usuario);

    // Verificar y actualizar el empleado relacionado
    if (usuario.empleado) {
      usuario.empleado.nombre_puesto = nombre_puesto;
      usuario.empleado.telefono_empleado = telefono_empleado;
      usuario.empleado.numero_empleado = numero_empleado; 
      await this.empleadoRepository.save(usuario.empleado);
    } else {
      throw new NotFoundException('Empleado asociado no encontrado');
    }

    return { success: true, msg: 'Usuario y empleado actualizados correctamente' }; */
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }

  /* async login(email: string, password: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { correo: email },
      relations: ['rol']
    });
  
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
  
    if (usuario.estado !== 'ACTIVO') {
      throw new ForbiddenException('La cuenta está desactivada');
    }
    if (!usuario.fecha_verificacion) {
      throw new ForbiddenException('La cuenta no ha verificado su correo electrónico');
    }
  
    const isPasswordValid = await bcrypt.compare(password, usuario.contrasena);
    if (!isPasswordValid) {
      throw new BadRequestException('Credenciales inválidas');
    }
    if (!usuario.rol) {
      throw new InternalServerErrorException('El rol del usuario no está definido');
    }
  
    // Crear el payload y firmar el token
    const payload = { username: usuario.correo, sub: usuario.id_usuario, rol: usuario.rol.nombre_rol };
    const token = this.jwtService.sign(payload);
  
    // Crear una nueva sesión y guardarla en la base de datos
    const nuevaSesion = new NET_SESION();
    nuevaSesion.usuario = usuario; // Asigna el usuario a la sesión
    nuevaSesion.token = token;
    nuevaSesion.fecha_creacion = new Date();
    nuevaSesion.fecha_expiracion = new Date(Date.now() + 1000 * 60 * 60 * 24); // Por ejemplo, 24 horas después
    nuevaSesion.estado = 'activa';
  
    await this.sesionRepository.save(nuevaSesion);
  
    return { token };
  } */

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('El Correo o Numero de ID ya esta registrado');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }

 /*  async findAllRolesExceptAdmin(): Promise<Net_Rol[]> {
    return this.rolRepository.createQueryBuilder('rol')
      .where('rol.nombre_rol != :nombre_rol', { nombre_rol: 'ADMINISTRADOR' })
      .getMany();
  } */
}
