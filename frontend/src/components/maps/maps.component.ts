import { Component, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.scss'
})
export class MapsComponent {
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

  zoom = 8;
  center: google.maps.LatLngLiteral = { lat: 14.107180, lng: -87.203741 };
  markerPositions: google.maps.LatLngLiteral[] = [{ lat: 14.107180, lng: -87.203741 }];
  display: any;

  constructor() { }

  addMarker(event: any) {
    if (event.latLng) {
      this.markerPositions.push(event.latLng.toJSON());
      this.display = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      alert(`Latitud: ${this.display.lat}\nLongitud: ${this.display.lng}`);
    }
  }

  moveToLocation(lat: number, lng: number) {
    this.center = { lat, lng };
    this.zoom = 15;
    this.markerPositions = [{ lat, lng }];
  }
}