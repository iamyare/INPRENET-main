import { Injectable, NotFoundException } from '@nestjs/common';
import { Net_Tipo_Persona } from '../entities/net_tipo_persona.entity';
import { Net_Persona } from '../entities/Net_Persona.entity';
import { NET_DETALLE_PERSONA } from '../entities/Net_detalle_persona.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AfiliacionService {
    constructor(
        @InjectRepository(NET_DETALLE_PERSONA)
        private readonly detallePersonaRepository: Repository<NET_DETALLE_PERSONA>,
        @InjectRepository(Net_Persona)
        private readonly personaRepository: Repository<Net_Persona>,
        @InjectRepository(Net_Tipo_Persona)
        private readonly tipoPersonaRepository: Repository<Net_Tipo_Persona>,
      ) {}

      async updateFotoPerfil(id: number, fotoPerfil: Buffer): Promise<Net_Persona> {
        const persona = await this.personaRepository.findOneBy({ id_persona: id });
        if (!persona) {
          throw new Error('Persona no encontrada');
        }
        persona.foto_perfil = fotoPerfil;
        return await this.personaRepository.save(persona);
      }

      async getPersonaByn_identificacioni(n_identificacion: string): Promise<Net_Persona> {
        
        const persona = await this.personaRepository.findOne({
          where: { n_identificacion },
          relations: [
            'tipoIdentificacion',
            'pais',
            'municipio',
            'municipio_defuncion',
            'profesion',
            'detallePersona',
            'detallePersona.tipoPersona',
            'detallePersona.estadoAfiliacion',
            'referenciasPersonalPersona',
            'personasPorBanco',
            'detalleDeduccion',
            'perfPersCentTrabs',
            'cuentas',
            'detallePlanIngreso',
            'colegiosMagisteriales',
          ],
        });
    
        if (!persona) {
          throw new NotFoundException(`Persona with DNI ${n_identificacion} not found`);
        }
    
        return persona;
      }

      async getCausantesByDniBeneficiario(n_identificacion: string): Promise<Net_Persona[]> {
        // Obtener la persona (beneficiario) por n_identificacion
        const beneficiario = await this.personaRepository.findOne({ where: { n_identificacion }, relations: ['detallePersona'] });
    
        if (!beneficiario) {
          throw new Error('Beneficiario no encontrado');
        }
    
        // Obtener el ID del tipo de persona basado en el nombre "BENEFICIARIO"
        const tipoPersona = await this.tipoPersonaRepository.findOne({ where: { tipo_persona: 'BENEFICIARIO' } });
        if (!tipoPersona) {
          throw new Error('Tipo de persona "BENEFICIARIO" no encontrado');
        }
    
        // Obtener todos los detalles de la persona del beneficiario
        const detalles = beneficiario.detallePersona.filter(d => d.ID_TIPO_PERSONA === tipoPersona.id_tipo_persona);
    
        if (detalles.length === 0) {
          throw new Error('Detalle de beneficiario no encontrado');
        }
    
        // Obtener todos los causantes usando los IDs_CAUSANTE de los detalles del beneficiario
        const causantes = await this.personaRepository.findByIds(detalles.map(d => d.ID_CAUSANTE));
    
        if (causantes.length === 0) {
          throw new Error('Causantes no encontrados');
        }
    
        return causantes;
      }


      
      
}
