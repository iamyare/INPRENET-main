import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RnpService } from '../../../services/rnp.service';
import { io, Socket } from 'socket.io-client';

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

  constructor(private rnpService: RnpService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.socket = io('http://localhost:3000');

    this.socket.on('fingerprint', (data: string) => {
      console.log('📡 Huella recibida del socket:', data);
      this.fingerprint = data;
      this.cdr.detectChanges();
    });
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
    if (!this.identificacion.trim()) {
      this.errorMessage = "Ingrese un número de identificación válido.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";
    const filenameWithoutExtension = this.filename.replace('.jpg', '');

    this.rnpService.verificarHuella(this.identificacion, filenameWithoutExtension).subscribe({
      next: (response: any) => {
        if (response.status === "NO") {
          this.verificado = false;
          this.errorMessage = response.message || "La huella no coincide.";
          this.resetData();
        } else {
          this.verificado = true;
          this.informacionGeneral = response.infoComplementariaResponse;
          this.identificacion = response.huellaResponse.NumeroIdentidad;
          this.fingerprint = `data:image/jpeg;base64,${response.fingerprint}`;
          this.fotoPersona = `data:image/jpeg;base64,${response.infoComplementariaResponse.foto}`;
          console.log("✅ Identificación y huella verificadas correctamente", response);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
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
    this.resetData();
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
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
