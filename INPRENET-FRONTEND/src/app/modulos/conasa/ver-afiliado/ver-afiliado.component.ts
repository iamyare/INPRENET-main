import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

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

  constructor(private datosEstaticosService: DatosEstaticosService) {}

  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  handlePersonaEncontrada(persona: any): void {
    console.log(persona);
    if (!persona) {
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
      tiposPersona: persona.TIPOS_PERSONA || [], // Ahora toma todos los tipos de persona
      estadoFallecido: fallecido === 'SI' ? 'FALLECIDO' : 'VIVO',
    };
  }

  private async cargarDepartamentos(): Promise<void> {
    this.departamentos = await this.datosEstaticosService.getDepartamentos();
  }
}
