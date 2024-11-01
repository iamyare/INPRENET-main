import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { LessThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/common/services/mail.service';
import * as bcrypt from 'bcrypt';
import { CreatePreRegistroDto } from './dto/create-pre-registro.dto';
import { Net_Seguridad } from './entities/net_seguridad.entity';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { LoginDto } from './dto/login.dto';
import { net_rol_modulo } from './entities/net_rol_modulo.entity';
import { Net_Usuario_Empresa } from './entities/net_usuario_empresa.entity';
import { net_usuario_modulo } from './entities/net_usuario_modulo.entity';
import { net_modulo } from './entities/net_modulo.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Cron } from '@nestjs/schedule';
import { Net_Empleado } from '../Empresarial/entities/net_empleado.entity';
import { Net_Empleado_Centro_Trabajo } from '../Empresarial/entities/net_empleado_centro_trabajo.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name)

  constructor(
    @InjectRepository(Net_Empleado)
    private readonly empleadoRepository: Repository<Net_Empleado>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(Net_Seguridad)
    private readonly seguridadRepository: Repository<Net_Seguridad>,
    @InjectRepository(Net_Empleado_Centro_Trabajo)
    private readonly empleadoCentroTrabajoRepository: Repository<Net_Empleado_Centro_Trabajo>,
    @InjectRepository(Net_Usuario_Empresa)
    private readonly usuarioEmpresaRepository: Repository<Net_Usuario_Empresa>,
    @InjectRepository(net_rol_modulo)
    private readonly rolModuloRepository: Repository<net_rol_modulo>,
    @InjectRepository(net_usuario_modulo)
    private readonly usuarioModuloRepository: Repository<net_usuario_modulo>,
    @InjectRepository(net_modulo)
    private readonly moduloRepository: Repository<net_modulo>,
  ) { }

  async login(loginDto: LoginDto) {
    const { correo, contrasena } = loginDto;
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
    if (usuario.usuarioModulos.length == 0) {
      throw new UnauthorizedException('No tiene roles asignados a ese usuario.');
    }
    const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const rolesModulos = usuario.usuarioModulos.map(um => ({
      rol: um.rolModulo.nombre,
      modulo: um.rolModulo.modulo.nombre
    }));

    const payload = {
      correo,
      sub: usuario.id_usuario_empresa,
      rolesModulos,
      idCentroTrabajo: usuario.empleadoCentroTrabajo.centroTrabajo.id_centro_trabajo,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '100d' });

    return { accessToken };
  }

  async logout(req, res) {
    return res.json({ message: 'Sesión cerrada' });
  }

  async obtenerPerfilPorCorreo(correo: string) {
    const usuario = await this.usuarioEmpresaRepository.findOne({
      where: { empleadoCentroTrabajo: { correo_1: correo } },
      relations: [
        'empleadoCentroTrabajo',
        'empleadoCentroTrabajo.empleado',
        'empleadoCentroTrabajo.centroTrabajo',
        'usuarioModulos',
        'usuarioModulos.rolModulo',
        'usuarioModulos.rolModulo.modulo',
      ],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async desactivarUsuario(idUsuario: number, fechaReactivacion: Date | null = null): Promise<void> {
    const usuario = await this.usuarioEmpresaRepository.findOne({ where: { id_usuario_empresa: idUsuario } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.estado = 'INACTIVO';
    usuario.fecha_desactivacion = new Date();
    usuario.fecha_reactivacion = fechaReactivacion;

    await this.usuarioEmpresaRepository.save(usuario);
  }

  async reactivarUsuario(idUsuario: number): Promise<void> {
    const usuario = await this.usuarioEmpresaRepository.findOne({ where: { id_usuario_empresa: idUsuario } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.fecha_reactivacion && usuario.fecha_reactivacion > new Date()) {
      throw new BadRequestException('El usuario no puede ser reactivado antes de la fecha de reactivación');
    }

    usuario.estado = 'ACTIVO';
    usuario.fecha_desactivacion = null;
    usuario.fecha_reactivacion = null;
    usuario.fecha_verificacion = new Date();

    await this.usuarioEmpresaRepository.save(usuario);
  }

  @Cron('0 0 * * *') // Se ejecuta cada día a medianoche
  async reactivarUsuariosAutomaticamente() {
    const usuarios = await this.usuarioEmpresaRepository.find({
      where: {
        estado: 'INACTIVO',
        fecha_reactivacion: LessThan(new Date()),
      },
    });

    for (const usuario of usuarios) {
      usuario.estado = 'ACTIVO';
      usuario.fecha_desactivacion = null;
      usuario.fecha_reactivacion = null;
      usuario.fecha_verificacion = new Date();
      await this.usuarioEmpresaRepository.save(usuario);
    }
  }

  async cambiarContrasena(correo: string, nuevaContrasena: string) {
    const usuario = await this.usuarioEmpresaRepository.findOne({
      where: { empleadoCentroTrabajo: { correo_1: correo } },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const salt = await bcrypt.genSalt(10);
    usuario.contrasena = await bcrypt.hash(nuevaContrasena, salt);

    await this.usuarioEmpresaRepository.save(usuario);

    return { message: 'Contraseña cambiada con éxito' };
  }

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
    const verificationUrl = `${process.env.HOST_FRONTEND}/register?token=${token}`;
    const imageUrl = "https://inprema.gob.hn/servicios-electronicos/"
    const htmlContent = `
   <div style="font-family: Arial, sans-serif; line-height: 1.6;">
     <h2 style="color: #13776B;">¡Bienvenido a INPRENET!</h2>
     <p>Hola ${nombreEmpleado},</p>
     <p>Estamos encantados de tenerte con nosotros y queremos asegurarnos de que tengas la mejor experiencia posible desde el primer día.</p>
     <div style="text-align: center;">
     <img src="${imageUrl}" alt="Logo INPREMA" style="max-width: 120px; margin-bottom: 10px;">
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
    const rol = await this.rolModuloRepository.findOne({
      where: { id_rol_modulo: idRole },
      relations: ['modulo', 'modulo.centroTrabajo'],
    });
    if (!rol) {
      throw new BadRequestException('El rol especificado no existe');
    }
    const nuevoEmpleado = this.empleadoRepository.create({
      nombreEmpleado,
    });
    const empleado = await this.empleadoRepository.save(nuevoEmpleado);
    const nuevoEmpleadoCentroTrabajo = this.empleadoCentroTrabajoRepository.create({
      empleado,
      correo_1: correo,
      numeroEmpleado,
      nombrePuesto,
      centroTrabajo: rol.modulo.centroTrabajo,
    });
    const empleadoCentroTrabajo = await this.empleadoCentroTrabajoRepository.save(nuevoEmpleadoCentroTrabajo);
    const nuevoUsuario = this.usuarioEmpresaRepository.create({
      estado: 'PENDIENTE',
      contrasena: await bcrypt.hash('temporal', 10),
      empleadoCentroTrabajo: empleadoCentroTrabajo,
    });
    const usuarioGuardado = await this.usuarioEmpresaRepository.save(nuevoUsuario);
    const usuarioModulo = this.usuarioModuloRepository.create({
      usuarioEmpresa: usuarioGuardado,
      rolModulo: rol,
    });
    await this.usuarioModuloRepository.save(usuarioModulo);
    const token = this.jwtService.sign({ correo });
    const logoPath = path.join(process.cwd(), 'assets', 'images', 'LOGO-INPRENET.png');
    if (!fs.existsSync(logoPath)) {
      this.logger.error('El archivo LOGO-INPRENET.png no se encontró en la ruta: ' + logoPath);
      throw new InternalServerErrorException('Error: El archivo LOGO-INPRENET.png no se encuentra en la ruta especificada.');
    }
    const verificationUrl = `${process.env.HOST_FRONTEND}/register?token=${token}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #13776B;">¡Bienvenido a 
          <span style="color: #14776B;">INPRE</span><span style="color: #33E4DC;">NET</span>!
        </h2>
        <p>Hola ${nombreEmpleado},</p>
        <p>Estamos encantados de tenerte con nosotros y queremos asegurarnos de que tengas la mejor experiencia posible desde el primer día.</p>
        <div style="text-align: center;">
          <img src="cid:logoInprema" alt="Logo INPREMA" style="width: 250px; height: auto; margin-bottom: 10px;">
          <p>Para empezar, necesitamos que completes tu registro. Esto nos ayudará a personalizar tu experiencia y asegurarnos de que tienes acceso a todas las funcionalidades de nuestra aplicación.</p>
          <p>Por favor, completa tu registro haciendo clic en el siguiente enlace:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #13776B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Completar Registro</a>
          </div>
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          <p>¡Gracias por unirte a nosotros!</p>
          <p>El equipo de INPRENET</p>
        </div>
      </div>`;

    await this.mailService.sendMail(correo, 'Completa tu registro', '', htmlContent, [
      {
        filename: 'LOGO-INPRENET.png',
        path: logoPath,
        cid: 'logoInprema'
      }
    ]);



  }

  async completarRegistro(token: string, completeRegistrationDto: CompleteRegistrationDto, archivoIdentificacionBuffer: Buffer | null, fotoEmpleadoBuffer: Buffer | null): Promise<void> {
    const { correo, contrasena, pregunta_de_usuario_1, respuesta_de_usuario_1, pregunta_de_usuario_2, respuesta_de_usuario_2, pregunta_de_usuario_3, respuesta_de_usuario_3, telefonoEmpleado, telefonoEmpleado2, numero_identificacion } = completeRegistrationDto;

    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.correo !== correo) {
        throw new BadRequestException('El correo no coincide');
      }
    } catch (error) {
      throw new BadRequestException('Token inválido o expirado');
    }

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

    usuario.contrasena = await bcrypt.hash(contrasena, 10);
    usuario.estado = 'ACTIVO';
    usuario.fecha_verificacion = new Date();
    usuario.empleadoCentroTrabajo.empleado.telefono_1 = telefonoEmpleado;
    usuario.empleadoCentroTrabajo.empleado.telefono_2 = telefonoEmpleado2;
    usuario.empleadoCentroTrabajo.empleado.numero_identificacion = numero_identificacion;

    // Solo asigna los archivos si están definidos
    if (archivoIdentificacionBuffer) {
      usuario.empleadoCentroTrabajo.empleado.archivo_identificacion = archivoIdentificacionBuffer;
    }
    if (fotoEmpleadoBuffer) {
      usuario.empleadoCentroTrabajo.empleado.foto_empleado = fotoEmpleadoBuffer;
    }

    await this.empleadoRepository.save(usuario.empleadoCentroTrabajo.empleado);
    await this.usuarioEmpresaRepository.save(usuario);

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

  async actualizarEmpleado(
    id: number,
    updateEmpleadoParcialDto: any,
    archivoIdentificacionBuffer: Buffer | null,
    fotoEmpleadoBuffer: Buffer | null
  ) {
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado: id },
    });

    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }
    empleado.nombreEmpleado = updateEmpleadoParcialDto.nombreEmpleado || empleado.nombreEmpleado;
    empleado.telefono_1 = updateEmpleadoParcialDto.telefono_1 || empleado.telefono_1;
    empleado.telefono_2 = updateEmpleadoParcialDto.telefono_2 || empleado.telefono_2;
    empleado.numero_identificacion = updateEmpleadoParcialDto.numero_identificacion || empleado.numero_identificacion;
    if (archivoIdentificacionBuffer) {
      empleado.archivo_identificacion = archivoIdentificacionBuffer;
    }

    if (fotoEmpleadoBuffer) {
      empleado.foto_empleado = fotoEmpleadoBuffer;
    }

    return this.empleadoRepository.save(empleado);
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

  async obtenerUsuariosPorModuloYCentroTrabajo(modulos: string[], idCentroTrabajo: number): Promise<any[]> {
    try {
      const queryBuilder = this.usuarioEmpresaRepository.createQueryBuilder('usuarioEmpresa')
        .leftJoinAndSelect('usuarioEmpresa.empleadoCentroTrabajo', 'empleadoCentroTrabajo')
        .leftJoinAndSelect('empleadoCentroTrabajo.empleado', 'empleado')
        .leftJoinAndSelect('empleadoCentroTrabajo.centroTrabajo', 'centroTrabajo')
        .leftJoinAndSelect('centroTrabajo.municipio', 'municipio')
        .leftJoinAndSelect('centroTrabajo.modulos', 'modulos')
        .leftJoinAndSelect('modulos.roles', 'roles')
        .leftJoinAndSelect('roles.modulo', 'rolesModulo')
        .where('centroTrabajo.id_centro_trabajo = :idCentroTrabajo', { idCentroTrabajo })
        .andWhere('modulos.nombre IN (:...modulos)', { modulos })
        .select([
          'usuarioEmpresa.id_usuario_empresa',
          'usuarioEmpresa.estado',
          'usuarioEmpresa.fecha_creacion',
          'usuarioEmpresa.fecha_verificacion',
          'usuarioEmpresa.fecha_modificacion',
          'empleadoCentroTrabajo.id_empleado_centro_trabajo',
          'empleadoCentroTrabajo.correo_1',
          'empleadoCentroTrabajo.correo_2',
          'empleadoCentroTrabajo.numeroEmpleado',
          'empleadoCentroTrabajo.nombrePuesto',
          'empleado.id_empleado',
          'empleado.nombreEmpleado',
          'empleado.telefono_1',
          'empleado.telefono_2',
          'empleado.numero_identificacion',
          'empleado.archivo_identificacion',
          'empleado.foto_empleado',
          'centroTrabajo.id_centro_trabajo',
          'centroTrabajo.nombre_centro_trabajo',
          'municipio.id_municipio',
          'municipio.nombre_municipio',
          'modulos.id_modulo',
          'modulos.nombre',
          'roles.id_rol_modulo',
          'roles.nombre',
          'rolesModulo.id_modulo',
          'rolesModulo.nombre'
        ]);

      const usuariosModulos = await queryBuilder.getMany();

      // Convertir los blobs a base64 antes de retornar los datos
      const usuariosModulosConBase64 = usuariosModulos.map(usuario => {
        if (usuario.empleadoCentroTrabajo && usuario.empleadoCentroTrabajo.empleado) {
          return {
            ...usuario,
            empleadoCentroTrabajo: {
              ...usuario.empleadoCentroTrabajo,
              empleado: {
                ...usuario.empleadoCentroTrabajo.empleado,
                archivo_identificacion: usuario.empleadoCentroTrabajo.empleado.archivo_identificacion
                  ? Buffer.from(usuario.empleadoCentroTrabajo.empleado.archivo_identificacion).toString('base64')
                  : null,
                foto_empleado: usuario.empleadoCentroTrabajo.empleado.foto_empleado
                  ? Buffer.from(usuario.empleadoCentroTrabajo.empleado.foto_empleado).toString('base64')
                  : null,
              },
            },
          };
        }
        return usuario;
      });

      return usuariosModulosConBase64;
    } catch (error) {
      console.error('Error al obtener usuarios por módulo y centro de trabajo:', error);
      throw new Error('Error al obtener usuarios por módulo y centro de trabajo.');
    }
  }

  async obtenerRolesPorModulo(modulo: string): Promise<net_rol_modulo[]> {
    return await this.rolModuloRepository.createQueryBuilder('rol')
      .innerJoinAndSelect('rol.modulo', 'modulo')
      .where('modulo.nombre = :modulo', { modulo })
      .getMany();
}

  async obtenerModulosPorCentroTrabajo(idCentroTrabajo: number): Promise<net_modulo[]> {
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

  async validarPreguntasSeguridad(correo: string, dto: ForgotPasswordDto): Promise<Net_Usuario_Empresa> {
    const usuario = await this.usuarioEmpresaRepository.findOne({
      where: { empleadoCentroTrabajo: { correo_1: correo } },
      relations: ['seguridad', 'empleadoCentroTrabajo'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const preguntasSeguridad = usuario.seguridad;

    let respuestasCorrectas = 0;

    preguntasSeguridad.forEach((pregunta, index) => {
      const respuestaUsuario = dto[`question${index + 1}Answer`].trim().toLowerCase();
      const respuestaCorrecta = pregunta.respuesta.trim().toLowerCase();
      if (respuestaUsuario === respuestaCorrecta) {
        respuestasCorrectas += 1;
      }
    });

    if (respuestasCorrectas < 2) {
      throw new BadRequestException('Respuestas incorrectas');
    }

    return usuario;
  }

  async crearTokenRestablecimiento(usuario: Net_Usuario_Empresa): Promise<string> {
    const payload = { id: usuario.id_usuario_empresa, email: usuario.empleadoCentroTrabajo.correo_1 };
    const token = this.jwtService.sign(payload);
    return token;
  }

  async enviarCorreoRestablecimiento(correo: string, token: string): Promise<void> {
    const urlRestablecimiento = `${process.env.HOST_FRONTEND}/restablecer-contrasena/${token}`;
    const asunto = 'Solicitud de restablecimiento de contraseña - INPRENET';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; text-align: center;">
        <h2 style="color: #13776B;">
          Solicitud de restablecimiento de contraseña en 
          <span style="color: #14776B;">INPRE</span><span style="color: #33E4DC;">NET</span>
        </h2>
        <p>Hola,</p>
        <p>Recientemente has solicitado restablecer tu contraseña en nuestra plataforma.</p>
        <p>Para proceder con el restablecimiento, por favor haz clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${urlRestablecimiento}" style="background-color: #13776B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Restablecer contraseña</a>
        </div>
        <p>Este enlace es válido por un tiempo limitado. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.</p>
        <p>El equipo de <strong><span style="color: #14776B;">INPRE</span><span style="color: #33E4DC;">NET</span></strong></p>
      </div>`;
  
    const textoPlano = `Hola,\n\nHas solicitado restablecer tu contraseña en nuestra plataforma INPRENET.\n\nPara hacerlo, por favor, haz clic en el siguiente enlace o cópialo en tu navegador: ${urlRestablecimiento}\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\nEl equipo de INPRENET`;
  
    await this.mailService.sendMail(correo, asunto, textoPlano, htmlContent);
  }
  
  async restablecerContrasena(token: string, nuevaContrasena: string): Promise<void> {
    let payload;

    try {
      payload = this.jwtService.verify(token);
    } catch (e) {
      console.log('Token no válido o ha expirado:', token);
      throw new NotFoundException('Token no válido o ha expirado');
    }

    const usuario = await this.usuarioEmpresaRepository.findOne({ where: { id_usuario_empresa: payload.id } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.contrasena = await bcrypt.hash(nuevaContrasena, 10);

    await this.usuarioEmpresaRepository.save(usuario);

    console.log('Contraseña restablecida correctamente para el usuario:', usuario.id_usuario_empresa);
  }

  async obtenerPreguntasSeguridad(correo: string): Promise<string[]> {
    const usuario = await this.usuarioEmpresaRepository.findOne({
      where: { empleadoCentroTrabajo: { correo_1: correo } },
      relations: ['seguridad'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario.seguridad.map(pregunta => pregunta.pregunta);
  }

}