import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { FormStateService } from 'src/app/services/form-state.service';

@Component({
  selector: 'app-camara',
  templateUrl: './camara.component.html',
  styleUrls: ['./camara.component.scss']
})
export class CamaraComponent implements OnInit {
  @Output() imageCaptured = new EventEmitter<string>();

  public mostrarWebcam = false;
  public dispositivoId!: string;
  public opcionesVideo: MediaTrackConstraints = {};
  public errors: WebcamInitError[] = [];
  public imagenWebcam!: WebcamImage;
  public trigger: Subject<void> = new Subject<void>();

  constructor(private formStateService: FormStateService) {}

  ngOnInit(): void {
  }

  public triggerCaptura(): void {
    this.mostrarWebcam = true;
    this.trigger.next();
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
    
    let message = 'Error al inicializar la cámara.';
    switch (error.mediaStreamError?.name) {
      case 'NotAllowedError':
        message = 'No se otorgaron permisos para usar la cámara.';
        break;
      case 'NotFoundError':
        message = 'No se encontró un dispositivo de cámara.';
        break;
      case 'NotReadableError':
        message = 'La cámara está en uso por otra aplicación.';
        break;
      default:
        message = `Error desconocido: ${error.message}`;
    }
  
    alert(message);
    console.error(message, error);
  }
  
  public handleImage(imagen: WebcamImage): void {
    if (imagen && imagen.imageAsDataUrl) {
      this.imagenWebcam = imagen;
      this.imageCaptured.emit(imagen.imageAsDataUrl);
      this.formStateService.setFotoPerfil(imagen.imageAsDataUrl);
      this.mostrarWebcam = false;
    } else {
      console.error('La imagen capturada no es válida');
    }
  }

  public resetCamera(): void {
    this.imagenWebcam = undefined!;
    this.mostrarWebcam = false;
    
    if (this.dispositivoId) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        stream.getTracks().forEach((track) => {
          try {
            track.stop(); // Detener la pista de video
          } catch (err) {
            console.error('Error deteniendo la pista de la cámara:', err);
          }
        });
      }).catch(error => {
        console.error('Error al obtener acceso a la cámara:', error);
      });
    }
    this.errors = [];
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
}
