import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-ver-afiliado',
  templateUrl: './ver-afiliado.component.html',
  styleUrls: ['./ver-afiliado.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class VerAfiliadoComponent implements OnInit {
  tipoAfiliado: any = null;
  departamentos: any[] = [];

  constructor(private datosEstaticosService: DatosEstaticosService,private afiliadoService: AfiliadoService) {}

  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  handlePersonaEncontrada(persona: any): void {
    if (!persona) {
      console.log(persona);
      
      this.tipoAfiliado = null;
      return;
    }
  
    const departamentoResidencia = this.departamentos.find(
      (d) => d.value === persona.id_departamento_residencia
    )?.label || 'No especificado';
  
    const fallecido = (persona.fallecido || '').trim().toUpperCase();
  
    this.tipoAfiliado = {
      ...persona,
      departamentoResidencia,
      estatusAfiliado: persona.estadoAfiliacion?.nombre_estado || 'No especificado',
      tipoPersona: persona.TIPO_PERSONA || 'No especificado',
      estadoFallecido: fallecido === 'SI' ? 'FALLECIDO' : 'VIVO',
    };
  }
  
  private async cargarDepartamentos(): Promise<void> {
    this.departamentos = await this.datosEstaticosService.getDepartamentos();
  }

  otraConsultaOpcional = (dni: string) => {
    /* return this.afiliadoService.getAfilPorConsultaAlternativa(dni).pipe(
      catchError((error) => {
        console.error('Error en consulta alternativa', error);
        return of(null);
      })
    ); */
  };
}
