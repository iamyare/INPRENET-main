import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RnpService } from '../../../services/rnp.service';
import { DireccionService } from '../../../services/direccion.service';
import { io, Socket } from 'socket.io-client';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import pdfMake from 'pdfmake/build/pdfmake';

@Component({
  selector: 'app-prueba-vida',
  templateUrl: './prueba-vida.component.html',
  styleUrls: ['./prueba-vida.component.scss']
})
export class PruebaVidaComponent implements OnInit, OnDestroy {
  fingerprint: string | null = null;
  verificado: boolean = false;
  identificacion: string = '';
  errorMessage: string = '';
  informacionGeneral: any = null;
  fotoPersona: string | null = null;
  private filename: string = "soloprueba.jpg";
  isLoading: boolean = false;
  private socket!: Socket;
  dispositivoIniciado: boolean = false;
  docenteData: any = null;
  generoSeleccionado: string = '';
  estadoCivilSeleccionado: string = '';
  form!: FormGroup;
  departamentos: { value: number, label: string }[] = [];
  municipiosNacimiento: { value: number, label: string }[] = [];
  municipiosResidencia: { value: number, label: string }[] = [];
  aldeas: { value: number, label: string }[] = [];
  

  constructor(private rnpService: RnpService, private cdr: ChangeDetectorRef, private fb: FormBuilder,
    private direccionService: DireccionService, private http: HttpClient) {
    this.form = this.fb.group({
      beneficiariosCorrectos: ['', Validators.required],
      encuesta: this.fb.group({
        pregunta1: ['', Validators.required],
        pregunta2: ['', Validators.required],
        pregunta3: [''],
        pregunta4: [''],
        pregunta5: ['']
      }),      
      datosPersona: this.fb.group({
        nombres: ['', [Validators.required, Validators.pattern(/^([A-ZÁÉÍÓÚÑa-záéíóúñ]+)(\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+){0,2}$/)]],
        apellidos: ['', [Validators.required, Validators.pattern(/^([A-ZÁÉÍÓÚÑa-záéíóúñ]+)(\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+)?$/)]],
        fecha_nacimiento: ['', Validators.required],
        genero: ['', Validators.required],
        estado_civil: ['', Validators.required],
        correo_1: ['', [Validators.required, Validators.email]],
        telefono_1: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
        rtn: ['', Validators.required],
        id_departamento_nacimiento: [null, Validators.required],
        id_municipio_nacimiento: [null, Validators.required],
        id_departamento_residencia: [null, Validators.required],
        id_municipio_residencia: [null, Validators.required],
        id_aldea: [null, Validators.required],
        direccion_residencia: ['', Validators.required],
      }),
      conyuge: this.fb.group({
        nombres: ['', [Validators.required, Validators.pattern(/^([A-ZÁÉÍÓÚÑa-záéíóúñ]+)(\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+){0,2}$/)]],
        apellidos: ['', [Validators.required, Validators.pattern(/^([A-ZÁÉÍÓÚÑa-záéíóúñ]+)(\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+)?$/)]],
        n_identificacion: ['', Validators.required],
        fecha_nacimiento: ['', Validators.required],
        telefono_1: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      }),
      referencias: this.fb.array([])
    });
    this.form.addControl('identificacion', this.fb.control('', Validators.required));
  }

  ngOnInit() {
    this.form.markAllAsTouched();
    this.setEncuestaValidations();
    this.socket = io('http://localhost:3000');
    this.socket.on('fingerprint', (data: string) => {
      console.log('📡 Huella recibida del socket:', data);
    
      if (data && typeof data === 'string') {
        const limpio = data.replace(/\s/g, ''); // elimina espacios/saltos de línea
        const alreadyFormatted = limpio.startsWith('data:image');
        this.fingerprint = alreadyFormatted ? limpio : `data:image/jpeg;base64,${limpio}`;
      } else {
        this.fingerprint = null;
      }
    
      this.cdr.detectChanges();
    });
    
    

    this.cargarDepartamentos();

    this.referencias.controls.forEach(ctrl => ctrl.markAllAsTouched());

    this.form.get('datosPersona.id_departamento_nacimiento')?.valueChanges.subscribe((id: number) => {
      if (id) this.cargarMunicipiosNacimiento(id);
    });

    this.form.get('datosPersona.id_departamento_residencia')?.valueChanges.subscribe((id: number) => {
      if (id) this.cargarMunicipiosResidencia(id);
    });
    this.form.get('datosPersona.id_municipio_residencia')?.valueChanges.subscribe((id: number) => {
      if (id) this.cargarAldeasPorMunicipio(id);
    });
  }

  private setEncuestaValidations(): void {
    this.form.get('encuesta.pregunta2')?.valueChanges.subscribe(value => {
      ['pregunta3', 'pregunta4', 'pregunta5'].forEach(p => {
        const ctrl = this.form.get(`encuesta.${p}`);
        if (value === 'si') {
          ctrl?.setValidators([Validators.required]);
        } else {
          ctrl?.clearValidators();
        }
        ctrl?.updateValueAndValidity();
      });
    });
  }
  

  get referencias(): FormArray {
    return this.form.get('referencias') as FormArray;
  }

  agregarReferencia(ref: any) {
    const nombres = [ref.primer_nombre, ref.segundo_nombre, ref.tercer_nombre].filter(Boolean).join(' ');
    const apellidos = [ref.primer_apellido, ref.segundo_apellido].filter(Boolean).join(' ');
  
    const refGroup = this.fb.group({
      nombres: [this.sanitize(nombres), Validators.required],
      apellidos: [this.sanitize(apellidos), Validators.required],
      tipo_referencia: [this.sanitize(ref.tipo_referencia), Validators.required],
      parentesco: [this.sanitize(ref.parentesco), Validators.required],
      telefono_personal: [this.sanitize(ref.telefono_personal), Validators.required],
    });
  
    this.referencias.push(refGroup);
  }
  
  get conoceInpremaSalud() {
    return this.form.get('encuesta.pregunta2')?.value;
  }
  

  iniciarDispositivo() {
    this.isLoading = true;
    this.rnpService.startDevice(this.filename).subscribe({
      next: (response) => {
        console.log(`✅ Dispositivo inicializado con archivo: ${this.filename}`, response);
        this.dispositivoIniciado = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.handleError('Error iniciando dispositivo', err);
      }
    });
  }

  verificarDatos() {
    const identificacionForm = this.form.get('identificacion')?.value;

  if (!identificacionForm || !identificacionForm.trim()) {
    this.errorMessage = "Ingrese un número de identificación válido.";
    return;
  }

  this.identificacion = identificacionForm.trim();
  
    this.isLoading = true;
    this.errorMessage = "";
    const filenameWithoutExtension = this.filename.replace('.jpg', '');
  
    console.log("🟡 Identificación ingresada:", this.identificacion);
  
    this.rnpService.verificarHuella(this.identificacion, filenameWithoutExtension).subscribe({
      next: (response: any) => {
        console.log(response);
        
        if (response.status === "NO") {
          this.verificado = false;
          this.errorMessage = response.message || "La huella no coincide.";
          this.resetData();
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }
  
        this.verificado = true;
        this.informacionGeneral = response.infoComplementariaResponse;
  
        let identificacionFinal = response.huellaResponse?.NumeroIdentidad?.trim();
        if (!identificacionFinal) {
          identificacionFinal = this.identificacion;
        }
  
        this.identificacion = identificacionFinal;
        
        this.fotoPersona = `data:image/jpeg;base64,${response.infoComplementariaResponse.foto}`;
  
        console.log("✅ Identificación final usada:", identificacionFinal);
  
        this.rnpService.obtenerDatosDocente(identificacionFinal).subscribe({
          next: (docenteResponse: any) => {
            if (docenteResponse?.datosPersona?.fecha_nacimiento) {
              const fechaISO = docenteResponse.datosPersona.fecha_nacimiento;
              docenteResponse.datosPersona.fecha_nacimiento = new Date(fechaISO + 'T00:00:00');
            }
        
            if (docenteResponse?.conyuge?.fecha_nacimiento) {
              const fechaConyugeISO = docenteResponse.conyuge.fecha_nacimiento;
              docenteResponse.conyuge.fecha_nacimiento = new Date(fechaConyugeISO + 'T00:00:00');
            }
        
            this.docenteData = docenteResponse;


            this.form.get('datosPersona')?.patchValue({
              nombres: docenteResponse.datosPersona.nombres,
              apellidos: docenteResponse.datosPersona.apellidos,
              fecha_nacimiento: docenteResponse.datosPersona.fecha_nacimiento,
              genero: docenteResponse.datosPersona.genero,
              estado_civil: docenteResponse.datosPersona.estado_civil,
              correo_1: docenteResponse.datosPersona.correo_1,
              telefono_1: docenteResponse.datosPersona.telefono_1,
              rtn: docenteResponse.datosPersona.rtn,
              id_departamento_nacimiento: docenteResponse.datosPersona.id_departamento_nacimiento,
              id_municipio_nacimiento: docenteResponse.datosPersona.id_municipio_nacimiento,
              id_departamento_residencia: docenteResponse.datosPersona.id_departamento_residencia,
              id_municipio_residencia: docenteResponse.datosPersona.id_municipio_residencia,
              aldea: docenteResponse.datosPersona.aldea,
              id_aldea: docenteResponse.datosPersona.id_aldea || null,
              direccion_residencia: docenteResponse.datosPersona.direccion_residencia
            });
            
            this.cargarAldeasPorMunicipio(docenteResponse.datosPersona.id_municipio_residencia);


            this.form.get('conyuge')?.patchValue({
              nombres: docenteResponse.conyuge?.nombres || '',
              apellidos: docenteResponse.conyuge?.apellidos || '',
              n_identificacion: docenteResponse.conyuge?.n_identificacion || '',
              fecha_nacimiento: docenteResponse.conyuge?.fecha_nacimiento || '',
              telefono_1: docenteResponse.conyuge?.telefono_1 || ''
            });

            // Limpiar referencias anteriores
            this.referencias.clear();

            // Si vienen referencias, las agregamos
            if (docenteResponse.referencias?.length > 0) {
              docenteResponse.referencias.forEach((ref: any) => {
                this.agregarReferencia(ref);
              });
            } else {
              // Si no vienen, agregamos una referencia personal y una familiar vacía
              this.referencias.push(this.fb.group({
                nombres: ['', Validators.required],
                apellidos: ['', Validators.required],
                tipo_referencia: ['REFERENCIA PERSONAL', Validators.required],
                parentesco: ['', Validators.required],
                telefono_personal: ['', Validators.required],
              }));
              this.referencias.push(this.fb.group({
                nombres: ['', Validators.required],
                apellidos: ['', Validators.required],
                tipo_referencia: ['REFERENCIA FAMILIAR', Validators.required],
                parentesco: ['', Validators.required],
                telefono_personal: ['', Validators.required],
              }));
}

            console.log("✅ Datos del docente:", docenteResponse);
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.isLoading = false;
            this.handleError('Error obteniendo datos del docente', err);
          }
        });
        
  
      },
      error: (err) => {
        this.isLoading = false;
        this.handleError('Error verificando datos', err);
      }
    });
  }
  
  ingresarOtraPersona() {
    this.verificado = false;
    this.dispositivoIniciado = false;
    this.identificacion = '';
    this.fingerprint = null;
    this.fotoPersona = null;
    this.errorMessage = '';
    this.informacionGeneral = null;
    this.docenteData = null;
  
    // Limpiar todo el formulario
    this.form.reset();
  
    // Limpiar y volver a agregar las 2 referencias (una personal y una familiar vacía)
    this.referencias.clear();
    this.referencias.push(this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      tipo_referencia: ['REFERENCIA PERSONAL', Validators.required],
      parentesco: ['', Validators.required],
      telefono_personal: ['', Validators.required],
    }));
    this.referencias.push(this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      tipo_referencia: ['REFERENCIA FAMILIAR', Validators.required],
      parentesco: ['', Validators.required],
      telefono_personal: ['', Validators.required],
    }));
  
    // Marcar como tocados para que las validaciones se muestren desde el inicio
    this.form.markAllAsTouched();
    this.referencias.controls.forEach(ctrl => ctrl.markAllAsTouched());
  
    // Reestablecer municipios y aldeas
    this.municipiosNacimiento = [];
    this.municipiosResidencia = [];
    this.aldeas = [];
  
    // Reiniciar selectores (por si los querés usar después para mostrar u ocultar cosas)
    this.generoSeleccionado = '';
    this.estadoCivilSeleccionado = '';
  }
  

  handleError(message: string, err: any) {
    this.verificado = false;
    this.fingerprint = null;
    this.fotoPersona = null;
    this.errorMessage = err.error?.details || message;
    console.error(`❌ ${message}:`, err);
  }

  resetData() {
    this.fingerprint = null;
    this.informacionGeneral = null;
    this.fotoPersona = null;
    this.identificacion = '';
    this.form.reset();
    this.referencias.clear();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  sanitize(value: string | null | undefined): string {
    return value ?? '';
  }
  
  estadoCivilMap: Record<number, string> = {
    0: 'SE IGNORA',
    1: 'SOLTERO(A)',
    2: 'CASADO(A)',
    3: 'DIVORCIADO(A)',
    4: 'UNION LIBRE',
    5: 'VIUDO(A)',
    6: 'OTRO',
  };
  
  estadoVivenciaMap: Record<number, string> = {
    0: 'Se Ignora',
    1: 'Vivo',
    2: 'Muerto',
    3: 'Desaparecido',
    4: 'Se Ignora',
  };
  
  sexoMap: Record<string, string> = {
    F: 'FEMENINO',
    M: 'MASCULINO',
    '': 'SE IGNORA'
  };

  estadoCivilOptions = [
    { value: 'SOLTERO/A', label: 'SOLTERO(A)' },
    { value: 'CASADO/A', label: 'CASADO(A)' },
    { value: 'DIVORCIADO/A', label: 'DIVORCIADO(A)' },
    { value: 'UNION LIBRE', label: 'UNION LIBRE' },
    { value: 'VIUDO/A', label: 'VIUDO(A)' },
    { value: 'OTRO', label: 'OTRO' },
    { value: 'SE IGNORA', label: 'SE IGNORA' }
  ];
  

  generoOptions = [
    { value: 'M', label: 'MASCULINO' },
    { value: 'F', label: 'FEMENINO' }
  ];
  

  getSexoDescripcion(codigo: string): string {
    const valor = (codigo || '').trim().toUpperCase();
    return this.sexoMap[valor] || 'SE IGNORA';
  }
  

  enviarFormulario() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.warn('❌ El formulario tiene errores. Por favor, complete todos los campos requeridos.');
      return;
    }
  
    const formData = this.form.value;
    const nombresSplit = formData.datosPersona.nombres.trim().split(' ');
    const apellidosSplit = formData.datosPersona.apellidos.trim().split(' ');
  
    formData.datosPersona.primer_nombre = nombresSplit[0] || '';
    formData.datosPersona.segundo_nombre = nombresSplit[1] || '';
    formData.datosPersona.tercer_nombre = nombresSplit[2] || '';
  
    formData.datosPersona.primer_apellido = apellidosSplit[0] || '';
    formData.datosPersona.segundo_apellido = apellidosSplit[1] || '';

    this.convertirImagenABase64('../assets/images/membratadoFinal.jpg')
  .then((fondoBase64) => {
    this.generarDocumentoPDF(formData, fondoBase64);
  })
  .catch((err) => {
    console.error('❌ Error cargando el membrete:', err);
    this.generarDocumentoPDF(formData, null);
  });

  
    console.log('✅ Información completa enviada:', formData);
    // Aquí puedes hacer un submit al backend si querés
  }
  
  
  cargarDepartamentos(): void {
    this.direccionService.getAllDepartments().subscribe({
      next: (data) => {
        const lista = data.map((d: any) => ({
          value: d.id_departamento,
          label: d.nombre_departamento
        }));
        this.departamentos = lista;
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
      }
    });
  }

  cargarMunicipiosNacimiento(idDepartamento: number): void {
    this.direccionService.getMunicipiosPorDepartamentoId(idDepartamento).subscribe({
      next: (data) => {
        this.municipiosNacimiento = data.map((m: any) => ({
          value: m.value,
          label: m.label
        }));
      },
      error: (err) => {
        console.error('Error al cargar municipios nacimiento:', err);
      }
    });
  }

  cargarMunicipiosResidencia(idDepartamento: number): void {
    this.direccionService.getMunicipiosPorDepartamentoId(idDepartamento).subscribe({
      next: (data) => {
        this.municipiosResidencia = data.map((m: any) => ({
          value: m.value,
          label: m.label
        }));
      },
      error: (err) => {
        console.error('Error al cargar municipios residencia:', err);
      }
    });
  }
  
  cargarAldeasPorMunicipio(municipioId: number): void {
    this.direccionService.getAldeasByMunicipio(municipioId).subscribe({
      next: (data) => {
        this.aldeas = data;
      },
      error: (err) => {
        console.error('Error al cargar aldeas:', err);
      }
    });
  }
  
  
  generarDocumentoPDF(data: any, fondoBase64: string | null) {
    const { datosPersona, conyuge, referencias } = data;
    const persona = datosPersona;
  
    const limpiarImagen = (img: string | null): string | null => {
      if (!img || typeof img !== 'string') return null;
      const limpio = img.trim();
      if (!limpio.startsWith('data:image/')) return null;
      return limpio.length > 100 ? limpio : null;
    };
  
    const imagenHuella = limpiarImagen(this.fingerprint);
    const imagenFoto = limpiarImagen(this.fotoPersona);
  
    const contenido: any[] = [
      {
        text: 'ACTA DE PRUEBA DE VIDA',
        style: 'header',
        alignment: 'center',
        margin: [0, 30, 0, 20]
      },
      {
        columns: [
          {
            width: '65%',
            table: {
              widths: ['auto', '*'],
              body: [
                [{ text: 'Nombre completo:', bold: true }, `${persona.nombres} ${persona.apellidos}`],
                [{ text: 'Identificación:', bold: true }, this.identificacion],
                [{ text: 'Fecha de nacimiento:', bold: true }, new Date(persona.fecha_nacimiento).toLocaleDateString()],
                [{ text: 'Género:', bold: true }, persona.genero],
                [{ text: 'Estado civil:', bold: true }, persona.estado_civil],
                [{ text: 'Correo electrónico:', bold: true }, persona.correo_1],
                [{ text: 'Teléfono:', bold: true }, persona.telefono_1],
                [{ text: 'RTN:', bold: true }, persona.rtn],
                [{ text: 'Dirección de residencia:', bold: true }, persona.direccion_residencia]
              ]
            },
            layout: 'noBorders',
            margin: [0, 0, 10, 0]
          },
          {
            width: '35%',
            stack: [
              {
                columns: [
                  {
                    width: '50%',
                    stack: [
                      { text: 'Foto del Docente', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 5] },
                      imagenFoto && {
                        image: imagenFoto,
                        width: 80,
                        height: 100,
                        alignment: 'center'
                      }
                    ].filter(Boolean)
                  },
                  {
                    width: '50%',
                    stack: [
                      { text: 'Huella Capturada', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 5] },
                      imagenHuella && {
                        image: imagenHuella,
                        width: 80,
                        height: 100,
                        alignment: 'center'
                      }
                    ].filter(Boolean)
                  }
                ],
                columnGap: 5
              }
            ]
          }
        ],
        columnGap: 10
      },
      {
        text: 'Información del Cónyuge',
        style: 'sectionHeader',
        margin: [0, 30, 0, 10]
      },
      {
        table: {
          widths: ['auto', '*', 'auto', '*'],
          body: [
            ['Nombre completo:', `${conyuge.nombres} ${conyuge.apellidos}`, 'Identificación:', conyuge.n_identificacion],
            ['Fecha de nacimiento:', new Date(conyuge.fecha_nacimiento).toLocaleDateString(), 'Teléfono:', conyuge.telefono_1]
          ]
        },
        layout: 'lightHorizontalLines'
      },
      {
        text: 'Referencias Personales y Familiares',
        style: 'sectionHeader',
        margin: [0, 30, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: 'Nombre completo', style: 'tableHeader' },
              { text: 'Tipo de referencia', style: 'tableHeader' },
              { text: 'Parentesco', style: 'tableHeader' },
              { text: 'Teléfono', style: 'tableHeader' }
            ],
            ...referencias.map((ref: any) => [
              `${ref.nombres} ${ref.apellidos}`,
              ref.tipo_referencia,
              ref.parentesco,
              ref.telefono_personal
            ])
          ]
        },
        layout: {
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#dddddd' : null,
          hLineColor: () => '#aaaaaa',
          vLineColor: () => '#aaaaaa'
        }
      },
      {
        columns: [
          {
            width: '50%',
            text: '_______________________________',
            alignment: 'center',
            margin: [0, 60, 0, 0]
          },
          {
            width: '50%',
            text: '_______________________________',
            alignment: 'center',
            margin: [0, 60, 0, 0]
          }
        ]
      },
      {
        columns: [
          {
            width: '50%',
            text: 'Firma del Docente',
            alignment: 'center',
            margin: [0, 5, 0, 0],
            style: 'signatureLabel'
          },
          {
            width: '50%',
            text: 'Firma del Analista',
            alignment: 'center',
            margin: [0, 5, 0, 0],
            style: 'signatureLabel'
          }
        ]
      }
    ];
  
    const docDefinition: any = {
      content: contenido,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#333'
        },
        subheader: {
          fontSize: 10,
          bold: true,
          color: '#444'
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          decoration: 'underline',
          color: '#000'
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'black'
        },
        signatureLabel: {
          fontSize: 10,
          bold: true
        }
      },
      defaultStyle: {
        fontSize: 10
      },
      pageMargins: [40, 60, 40, 60],
      background: fondoBase64
        ? {
            image: fondoBase64,
            width: 595,
            height: 842,
            absolutePosition: { x: 0, y: 0 }
          }
        : undefined
    };
  
    pdfMake.createPdf(docDefinition).open();
  }
  
  
  convertirImagenABase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg'));
        } else {
          reject('Error al convertir imagen');
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  }
  
  
}
