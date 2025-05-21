import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as soap from 'soap';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { RnpGateway } from './rnp.gateway';
import { AfiliadoService } from '../Persona/afiliado.service';
import { AfiliacionService } from '../Persona/afiliacion/afiliacion.service';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { net_persona } from '../Persona/entities/net_persona.entity';
import { EntityManager, Repository } from 'typeorm';
import { net_detalle_persona } from '../Persona/entities/net_detalle_persona.entity';

@Injectable()
export class RnpService {
  private readonly WSDL_URL = 'http://10.100.0.56:8080/InpremaRNP/VerificaInfoRNP?wsdl';
  private scannerProcess: ChildProcessWithoutNullStreams | null = null;

  constructor(private readonly rnpGateway: RnpGateway, private readonly afiliadoService: AfiliadoService,
     private readonly afiliacionService: AfiliacionService,
    @InjectRepository(net_persona)
    private readonly personaRepository: Repository<net_persona>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectRepository(net_detalle_persona)
    private detallePersonaRepository: Repository<net_detalle_persona>,) {}

  startScannerProcess(filename = 'fingerprint.jpg') {
    if (!this.scannerProcess) {
      console.log(`Iniciando proceso Java con archivo: ${filename}`);
      this.scannerProcess = spawn('java', ['-jar', 'ZKFPService.jar', 'opendevice', filename]);

      this.scannerProcess.stdout.on('data', (data) => {
        console.log(`Respuesta: ${data.toString().trim()}`);

        if (fs.existsSync(filename)) {
          const imageBase64 = fs.readFileSync(filename, { encoding: 'base64' });
          this.rnpGateway.sendFingerprint(imageBase64);
          console.log(`📡 Huella capturada y enviada por WebSocket`);
        }
      });

      this.scannerProcess.stderr.on('data', (data) => console.error(`Error: ${data.toString().trim()}`));

      this.scannerProcess.on('close', (code) => {
        console.log(`Proceso Java finalizado con código ${code}`);
        this.scannerProcess = null;
      });

      return { status: "Dispositivo inicializado y en ejecución", filename };
    } else {
      return { status: "El dispositivo ya está en ejecución" };
    }
  }

  async enviarComparaHuellaInscrito(numeroIdentidad: string, imgHuella: string) {
    try {
      const client = await soap.createClientAsync(this.WSDL_URL);
      console.log('✅ Cliente SOAP creado exitosamente.');

      const args = {
        NumeroIdentidad: numeroIdentidad,
        imgHuella: imgHuella,
        Digito: 2,
        CodigoInstitucion: 'PRUEBAS',
        CodigoSeguridad: 'T3$T1NG',
        UsuarioInstitucion: 'Usuario13',
      };

      console.log('🔍 Enviando solicitud SOAP (ComparaHuellaInscrito):', args);
      const [result] = await client.ComparaHuellaInscritoAsync(args);
      console.log('✅ Respuesta del servicio SOAP (ComparaHuellaInscrito):', result);

      return result.return;
    } catch (error) {
      console.error('❌ Error en enviarComparaHuellaInscrito:', error);
      throw new Error('Error en enviarComparaHuellaInscrito: ' + error.message);
    }
  }

  async enviarInfComplementariaInscripcionSOAP(numeroIdentidad: string) {
    try {
      const client = await soap.createClientAsync(this.WSDL_URL);
      console.log('✅ Cliente SOAP creado exitosamente.');

      const args = {
        NumeroIdentidad: numeroIdentidad,
        CodigoInstitucion: 'PRUEBAS',
        CodigoSeguridad: 'T3$T1NG',
        UsuarioInstitucion: 'Usuario13',
      };

      console.log('🔍 Enviando solicitud SOAP (ComparaInfComplementariaInscripcion):', args);
      const [result] = await client.ComparaInfComplementariaInscripcionAsync(args);
      console.log('✅ Respuesta del servicio SOAP (ComparaInfComplementariaInscripcion):', result);

      return result.return;
    } catch (error) {
      console.error('❌ Error en enviarInfComplementariaInscripcionSOAP:', error);
      throw new Error('Error en enviarInfComplementariaInscripcionSOAP: ' + error.message);
    }
  }

  async verificarHuella(numeroIdentidad: string, imageName: string) {
    try {
      const sharedFolder = '\\\\10.100.0.56\\InpremaRNPImagenHuella';
      const cleanImageName = imageName.replace('.jpg', '');

      const sourcePath = path.resolve(cleanImageName + '.jpg');
      const destPath = path.join(sharedFolder, cleanImageName + '.jpg');
  
      if (!fs.existsSync(sourcePath)) {
        throw new Error('La imagen no existe en el servidor');
      }
  
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Imagen ${cleanImageName}.jpg movida exitosamente a la carpeta compartida`);
  
      const huellaResponse = await this.enviarComparaHuellaInscrito(numeroIdentidad, cleanImageName);
  
      if (huellaResponse.message !== 'SI') {
        console.log('❌ La huella no coincide');
        return {
          status: 'NO',
          message: 'La huella no coincide',
          huellaResponse,
        };
      }

      console.log('✅ La huella coincide, obteniendo información complementaria');

      const infoComplementariaResponse = await this.enviarInfComplementariaInscripcionSOAP(numeroIdentidad);

      console.log('✅ Información complementaria obtenida exitosamente');

      return {
        status: 'OK',
        huellaResponse,
        infoComplementariaResponse,
      };
    } catch (error) {
      console.error('❌ Error en verificarHuella:', error);
      throw new Error('Error en verificarHuella: ' + error.message);
    }
  }

  async obtenerDatosPersona(numeroIdentidad: string): Promise<any> {
    try {
        const beneficiarios = await this.afiliadoService.getAllBenDeAfil(numeroIdentidad);
        const referencias = await this.afiliacionService.obtenerReferenciasPorIdentificacion(numeroIdentidad);
        const persona = await this.personaRepository.findOne({
            where: { n_identificacion: numeroIdentidad },
            relations: [
                'municipio',
                'municipio.departamento',
                'municipio_nacimiento',
                'municipio_nacimiento.departamento',
                'aldea'
            ],
        });

        if (!persona) {
            throw new Error(`No se encontró la persona con identificación ${numeroIdentidad}`);
        }

        const detallePersona = await this.detallePersonaRepository.find({
          where: { ID_PERSONA: persona.id_persona },
          select: ['ID_TIPO_PERSONA']
        });
    
        const tiposPermitidos = [1, 2, 3];
        const tieneTipoPermitido = detallePersona.some(dp => tiposPermitidos.includes(dp.ID_TIPO_PERSONA));
    
        if (!tieneTipoPermitido) {
          throw new Error(`La persona con identificación ${numeroIdentidad} no tiene un tipo válido (1, 2 o 3).`);
        }

        // Obtener el cónyuge desde la tabla NET_FAMILIA
        const conyuge = await this.entityManager.query(`
            SELECT p.N_IDENTIFICACION, p.PRIMER_NOMBRE, p.SEGUNDO_NOMBRE, p.TERCER_NOMBRE, p.PRIMER_APELLIDO, p.SEGUNDO_APELLIDO, p.FECHA_NACIMIENTO, p.TELEFONO_1
            FROM NET_FAMILIA f
            JOIN NET_PERSONA p ON f.ID_PERSONA = p.ID_PERSONA
            WHERE f.PARENTESCO = 'CÓNYUGE'
            AND f.ID_PERSONA_REFERENCIA = ${persona.id_persona}
        `);

        const datosConyuge = conyuge.length ? {
            n_identificacion: conyuge[0].N_IDENTIFICACION,
            nombres: `${conyuge[0].PRIMER_NOMBRE} ${conyuge[0].SEGUNDO_NOMBRE || ''} ${conyuge[0].TERCER_NOMBRE || ''}`.trim(),
            apellidos: `${conyuge[0].PRIMER_APELLIDO} ${conyuge[0].SEGUNDO_APELLIDO || ''}`.trim(),
            fecha_nacimiento: conyuge[0].FECHA_NACIMIENTO ? conyuge[0].FECHA_NACIMIENTO.toISOString().split('T')[0] : null,
            telefono_1: conyuge[0].TELEFONO_1,
        } : null;

        const datosPersona = {
          nombres: `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.tercer_nombre || ''}`.trim(),
          apellidos: `${persona.primer_apellido} ${persona.segundo_apellido || ''}`.trim(),
          fecha_nacimiento: persona.fecha_nacimiento,
          municipio_nacimiento: persona.municipio_nacimiento?.nombre_municipio || null,
          departamento_nacimiento: persona.municipio_nacimiento?.departamento?.nombre_departamento || null,
          id_municipio_nacimiento: persona.municipio_nacimiento?.id_municipio || null,
          id_departamento_nacimiento: persona.municipio_nacimiento?.departamento?.id_departamento || null,
          rtn: persona.rtn,
          genero: persona.genero,
          estado_civil: persona.estado_civil,
          telefono_1: persona.telefono_1,
          municipio_residencia: persona.municipio?.nombre_municipio || null,
          departamento_residencia: persona.municipio?.departamento?.nombre_departamento || null,
          id_municipio_residencia: persona.municipio?.id_municipio || null,
          id_departamento_residencia: persona.municipio?.departamento?.id_departamento || null,
          correo_1: persona.correo_1,
          aldea: persona.aldea?.nombre_aldea || null,
          direccion_residencia: persona.direccion_residencia,
          id_aldea: persona.aldea?.id_aldea || null,
      };
      
        console.log(`✅ Datos de la persona obtenidos para ${numeroIdentidad}:`, datosPersona);
        console.log(`✅ Datos del cónyuge obtenidos para ${numeroIdentidad}:`, datosConyuge);

        return {
            datosPersona,
            conyuge: datosConyuge,
            beneficiarios,
            referencias,
        };
    } catch (error) {
        console.error(`❌ Error obteniendo datos de la persona: ${error.message}`);
        throw new Error(`Error obteniendo datos de la persona: ${error.message}`);
    }
}





}