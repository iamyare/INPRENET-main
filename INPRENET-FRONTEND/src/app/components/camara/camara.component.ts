import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { FormStateService } from 'src/app/services/form-state.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-camara',
  templateUrl: './camara.component.html',
  styleUrls: ['./camara.component.scss']
})
export class CamaraComponent implements OnInit {
  @Output() imageCaptured = new EventEmitter<string>();

  public mostrarWebcam = true;
  public permitirCambioCamara = true;
  public multiplesCamarasDisponibles = false;
  public dispositivoId!: string;
  public opcionesVideo: MediaTrackConstraints = {};
  public errors: WebcamInitError[] = [];
  public imagenWebcam!: WebcamImage;
  public trigger: Subject<void> = new Subject<void>();
  private siguienteWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  constructor(private formStateService: FormStateService, private fb: FormBuilder) {}

  ngOnInit(): void {
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

  public showNextWebcam(directionOnDeviceId: boolean | string): void {
    this.siguienteWebcam.next(directionOnDeviceId);
  }

  public handleImage(imagen: WebcamImage): void {
    if (imagen && imagen.imageAsDataUrl) {
      this.imagenWebcam = imagen;
      this.imageCaptured.emit(imagen.imageAsDataUrl);
      this.formStateService.setFotoPerfil(imagen.imageAsDataUrl);
    } else {
      console.error('La imagen capturada no es válida');
    }
  }

  public cameraSwitched(dispositivoId: string): void {
    this.dispositivoId = dispositivoId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.siguienteWebcam.asObservable();
  }
}
