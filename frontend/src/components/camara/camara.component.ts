import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import { FormStateService } from 'src/app/services/form-state.service';

@Component({
  selector: 'app-camara',
  templateUrl: './camara.component.html',
  styleUrl: './camara.component.scss'
})
export class CamaraComponent {
  title = 'camaraapp';

  @Output() imageCaptured = new EventEmitter<string>();

  constructor(private formStateService: FormStateService) {}

  // Hacer Toogle on/off
  public mostrarWebcam = true;
  public permitirCambioCamara = true;
  public multiplesCamarasDisponibles = false;
  public dispositivoId!: string;
  public opcionesVideo: MediaTrackConstraints = {};

  // Errores al iniciar la cámara
  public errors: WebcamInitError[] = [];

  // Ultima captura o foto
  public imagenWebcam!: WebcamImage;

  // Cada Trigger para una nueva captura o foto
  public trigger: Subject<void> = new Subject<void>();

  // Cambiar a la siguiente o anterior cámara
  private siguienteWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multiplesCamarasDisponibles = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerCaptura(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.mostrarWebcam = !this.mostrarWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOnDeviceId: boolean|string): void {
    this.siguienteWebcam.next(directionOnDeviceId);
  }

  public handleImage(imagen: WebcamImage): void {
    this.imagenWebcam = imagen;
    this.imageCaptured.emit(imagen.imageAsDataUrl);
    this.formStateService.setFotoPerfil(imagen.imageAsDataUrl);
  }

  public cameraSwitched(dispositivoId: string): void {
    console.log('Dispositivo Actual: ' + dispositivoId);
    this.dispositivoId = dispositivoId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.siguienteWebcam.asObservable();
  }
}

