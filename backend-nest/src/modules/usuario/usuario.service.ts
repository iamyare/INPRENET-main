import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { In, Not, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/common/services/mail.service';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { NET_USUARIO_PRIVADA } from './entities/net_usuario_privada.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { NET_SESION } from './entities/net_sesion.entity';
import { CreatePreRegistroDto } from './dto/create-pre-registro.dto';
import { Net_Empleado } from '../Empresarial/entities/net_empleado.entity';
import { Net_Seguridad } from './entities/net_seguridad.entity';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { LoginDto } from './dto/login.dto';
import { Net_Empleado_Centro_Trabajo } from '../Empresarial/entities/net_empleado_centro_trabajo.entity';
import { Net_Rol_Modulo } from './entities/net_rol_modulo.entity';
import { Net_Usuario_Empresa } from './entities/net_usuario_empresa.entity';
import { Net_Usuario_Modulo } from './entities/net_usuario_modulo.entity';
import { Net_Modulo } from './entities/net_modulo.entity';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name)

  constructor(

    @InjectRepository(NET_USUARIO_PRIVADA)
    private readonly usuarioPrivadaRepository: Repository<NET_USUARIO_PRIVADA>,
    @InjectRepository(Net_Empleado)
    private readonly empleadoRepository: Repository<Net_Empleado>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(NET_SESION)
    private readonly sesionRepository: Repository<NET_SESION>,
    @InjectRepository(Net_Seguridad)
    private readonly seguridadRepository: Repository<Net_Seguridad>,
    @InjectRepository(Net_Centro_Trabajo)
    private centroTrabajoRepository: Repository<Net_Centro_Trabajo>,
    @InjectRepository(Net_Empleado_Centro_Trabajo)
    private readonly empleadoCentroTrabajoRepository: Repository<Net_Empleado_Centro_Trabajo>,
    @InjectRepository(Net_Usuario_Empresa)
    private readonly usuarioEmpresaRepository: Repository<Net_Usuario_Empresa>,
    @InjectRepository(Net_Rol_Modulo)
    private readonly rolModuloRepository: Repository<Net_Rol_Modulo>,
    @InjectRepository(Net_Usuario_Modulo)
    private readonly usuarioModuloRepository: Repository<Net_Usuario_Modulo>,
    @InjectRepository(Net_Modulo)
    private readonly moduloRepository: Repository<Net_Modulo>,
  ) { }

  async preRegistroAdmin(createPreRegistroDto: CreatePreRegistroDto): Promise<void> {
    const { nombreEmpleado, nombrePuesto, correo, numeroEmpleado, idModulo } = createPreRegistroDto;
  
    // Verificar si el usuario ya existe
    const usuarioExistente = await this.usuarioEmpresaRepository.findOne({
      relations: ['empleadoCentroTrabajo'],
      where: {
        empleadoCentroTrabajo: {
          correo_1: correo,
        },
      },
    });
  
    if (usuarioExistente) {
      throw new BadRequestException('El correo ya está registrado');
    }
  
    // Verificar si el módulo existe y obtener el centro de trabajo
    const modulo = await this.moduloRepository.findOne({
      where: { id_modulo: idModulo },
      relations: ['centroTrabajo'],
    });
  
    if (!modulo) {
      throw new BadRequestException('El módulo especificado no existe');
    }
  
    // Asignar el rol de administrador (ID_ROLE_ADMIN)
    const rolAdmin = await this.rolModuloRepository.findOne({
      where: { modulo: { id_modulo: idModulo }, nombre: 'ADMINISTRADOR' },
    });
  
    if (!rolAdmin) {
      throw new BadRequestException('El rol de administrador no existe para el módulo especificado');
    }
  
    // Crear un nuevo empleado
    const nuevoEmpleado = this.empleadoRepository.create({
      nombreEmpleado,
    });
  
    const empleado = await this.empleadoRepository.save(nuevoEmpleado);
  
    // Crear una nueva relación de empleado con centro de trabajo
    const nuevoEmpleadoCentroTrabajo = this.empleadoCentroTrabajoRepository.create({
      empleado,
      correo_1: correo,
      numeroEmpleado,
      nombrePuesto,
      centroTrabajo: modulo.centroTrabajo,
    });
  
    const empleadoCentroTrabajo = await this.empleadoCentroTrabajoRepository.save(nuevoEmpleadoCentroTrabajo);
  
    // Crear un nuevo usuario
    const nuevoUsuario = this.usuarioEmpresaRepository.create({
      estado: 'PENDIENTE',
      contrasena: await bcrypt.hash('temporal', 10),
      empleadoCentroTrabajo: empleadoCentroTrabajo,
    });
  
    const usuarioGuardado = await this.usuarioEmpresaRepository.save(nuevoUsuario);
  
    // Crear la relación en Net_Usuario_Modulo
    const usuarioModulo = this.usuarioModuloRepository.create({
      usuarioEmpresa: usuarioGuardado,
      rolModulo: rolAdmin,
    });
  
    await this.usuarioModuloRepository.save(usuarioModulo);
  
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
        <img src="https://inprema.gob.hn/wp-content/uploads/2021/11/inprema-logo-dorado.png" alt="Descripción de la imagen" width="150" height="auto">
        <p>Para empezar, necesitamos que completes tu registro como administrador. Esto nos ayudará a personalizar tu experiencia y asegurarnos de que tienes acceso a todas las funcionalidades de nuestra aplicación.</p>
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
  

  async preRegistro(createPreRegistroDto: CreatePreRegistroDto): Promise<void> {
    const { nombreEmpleado, nombrePuesto, correo, numeroEmpleado, idRole } = createPreRegistroDto;

    // Verificar si el usuario ya existe
    const usuarioExistente = await this.usuarioEmpresaRepository.findOne({
      relations: ['empleadoCentroTrabajo'],
      where: {
        empleadoCentroTrabajo: {
          correo_1: correo,
        },
      },
    });

    if (usuarioExistente) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Verificar si el rol existe
    const rol = await this.rolModuloRepository.findOne({
      where: { id_rol_modulo: idRole },
      relations: ['modulo', 'modulo.centroTrabajo'],
    });

    if (!rol) {
      throw new BadRequestException('El rol especificado no existe');
    }

    // Crear un nuevo empleado
    const nuevoEmpleado = this.empleadoRepository.create({
      nombreEmpleado,
    });

    const empleado = await this.empleadoRepository.save(nuevoEmpleado);

    // Crear una nueva relación de empleado con centro de trabajo
    const nuevoEmpleadoCentroTrabajo = this.empleadoCentroTrabajoRepository.create({
      empleado,
      correo_1: correo,
      numeroEmpleado,
      nombrePuesto,
      centroTrabajo: rol.modulo.centroTrabajo,
    });

    const empleadoCentroTrabajo = await this.empleadoCentroTrabajoRepository.save(nuevoEmpleadoCentroTrabajo);

    // Crear un nuevo usuario
    const nuevoUsuario = this.usuarioEmpresaRepository.create({
      estado: 'PENDIENTE',
      contrasena: await bcrypt.hash('temporal', 10),
      empleadoCentroTrabajo: empleadoCentroTrabajo,
    });

    const usuarioGuardado = await this.usuarioEmpresaRepository.save(nuevoUsuario);

    // Crear la relación en Net_Usuario_Modulo
    const usuarioModulo = this.usuarioModuloRepository.create({
      usuarioEmpresa: usuarioGuardado,
      rolModulo: rol,
    });

    await this.usuarioModuloRepository.save(usuarioModulo);

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
      <img src="https://inprema.gob.hn/wp-content/uploads/2021/11/inprema-logo-dorado.png" alt="Descripción de la imagen" width="150" height="auto">
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

    // Verificar el token JWT
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.correo !== correo) {
        throw new BadRequestException('El correo no coincide');
      }
    } catch (error) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Encontrar el usuario pendiente
    const usuario = await this.usuarioEmpresaRepository.findOne({
      where: {
        estado: 'PENDIENTE',
        empleadoCentroTrabajo: {
          correo_1: correo,
        },
      },
      relations: ['empleadoCentroTrabajo', 'empleadoCentroTrabajo.empleado'],
    });

    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado o ya registrado');
    }

    // Actualizar la información del usuario y del empleado
    usuario.contrasena = await bcrypt.hash(contrasena, 10);
    usuario.estado = 'ACTIVO';
    usuario.fecha_verificacion = new Date();
    usuario.empleadoCentroTrabajo.empleado.telefono_1 = telefonoEmpleado;
    usuario.empleadoCentroTrabajo.empleado.numero_identificacion = numero_identificacion;
    usuario.empleadoCentroTrabajo.empleado.archivo_identificacion = archivo_identificacion;

    // Guardar los cambios en la base de datos
    await this.empleadoRepository.save(usuario.empleadoCentroTrabajo.empleado);
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

  async login(loginDto: LoginDto) {
    const { correo, contrasena } = loginDto;

    // Encontrar el usuario por correo
    const usuario = await this.usuarioEmpresaRepository.findOne({
      where: {
        empleadoCentroTrabajo: {
          correo_1: correo,
        },
      },
      relations: ['empleadoCentroTrabajo', 'empleadoCentroTrabajo.centroTrabajo', 'usuarioModulos', 'usuarioModulos.rolModulo', 'usuarioModulos.rolModulo.modulo'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar la contraseña
    const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar el payload del token
    const rolesModulos = usuario.usuarioModulos.map(um => ({
      rol: um.rolModulo.nombre,
      modulo: um.rolModulo.modulo.nombre
    }));

    const payload = {
      correo,
      sub: usuario.id_usuario_empresa,
      rolesModulos: rolesModulos,
      idCentroTrabajo: usuario.empleadoCentroTrabajo.centroTrabajo.id_centro_trabajo,
    };

    // Firmar el token JWT
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async getRolesPorEmpresa(centroId: number) {
    /* return this.rolEmpresaRepository.find({
      where: {
        centroTrabajo: { id_centro_trabajo: centroId },
        nombre: Not('ADMINISTRADOR')
      },
    }); */
  }

  /*  async findAllRolesExceptAdmin(): Promise<Net_Rol[]> {
    return this.rolRepository.createQueryBuilder('rol')
      .where('rol.nombre_rol != :nombre_rol', { nombre_rol: 'ADMINISTRADOR' })
      .getMany();
  } */

  
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

  async getUsuariosPorCentro(centroTrabajoId: number) {
    /* try {
      const usuarios = await this.usuarioRepository.createQueryBuilder('usuario')
        .innerJoinAndSelect('usuario.empleadoCentroTrabajo', 'empleadoCentroTrabajo')
        .innerJoinAndSelect('empleadoCentroTrabajo.centroTrabajo', 'centroTrabajo')
        .innerJoinAndSelect('empleadoCentroTrabajo.empleado', 'empleado')
        .where('centroTrabajo.id_centro_trabajo = :centroTrabajoId', { centroTrabajoId })
        .getMany();

      return usuarios;
    } catch (error) {
      this.logger.error(`Failed to get users for center with id ${centroTrabajoId}`, error.stack);
      throw new Error(`Failed to get users for center with id ${centroTrabajoId}`);
    } */
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
  

  findAll(paginationDto: PaginationDto) {
    /* const { limit = 10, offset = 0 } = paginationDto
    return this.usuarioRepository.find({
      take: limit,
      skip: offset
    }); */
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

  async obtenerUsuariosPorModulos(modulos: string[]): Promise<Net_Usuario_Empresa[]> {
    const usuariosModulos = await this.usuarioModuloRepository.find({
      where: { rolModulo: { modulo: { nombre: In(modulos) } } },
      relations: ['usuarioEmpresa', 'usuarioEmpresa.empleadoCentroTrabajo', 'usuarioEmpresa.empleadoCentroTrabajo.empleado'],
      select: {
        usuarioEmpresa: {
          id_usuario_empresa: true,
          estado: true,
          contrasena: false, // Si no necesitas la contraseña
          fecha_creacion: true,
          fecha_verificacion: true,
          fecha_modificacion: true,
          empleadoCentroTrabajo: {
            id_empleado_centro_trabajo: true,
            correo_1: true,
            correo_2: true,
            numeroEmpleado: true,
            nombrePuesto: true,
            empleado: {
              id_empleado: true,
              nombreEmpleado: true,
              telefono_1: true,
              numero_identificacion: true,
              // archivo_identificacion: false, // Excluir el campo BLOB
            },
          },
        },
      },
    });

    return usuariosModulos.map(um => um.usuarioEmpresa);
  }

  async obtenerRolesPorModulo(modulo: string): Promise<Net_Rol_Modulo[]> {
    return await this.rolModuloRepository.find({
      where: { modulo: { nombre: modulo } },
      relations: ['modulo'],
    });
  }

  async obtenerModulosPorCentroTrabajo(idCentroTrabajo: number): Promise<Net_Modulo[]> {
    return this.moduloRepository.find({
      where: {
        centroTrabajo: {
          id_centro_trabajo: idCentroTrabajo,
        },
      },
      relations: ['centroTrabajo'],
    });
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
