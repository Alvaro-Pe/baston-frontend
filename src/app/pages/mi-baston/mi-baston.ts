import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../core/services/storage';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';



@Component({
  selector: 'app-mi-baston',
  imports: [CommonModule],
  templateUrl: './mi-baston.html',
  styleUrl: './mi-baston.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiBaston implements OnInit, AfterViewInit, OnDestroy {

  baston: any = null;
  lecturasGps: any[] = [];
  lecturaDistancia: any = null;
  buzzer: any = null;
  horaActual = '';
  loading = true;
  mensajeExito = '';
  mensajeError = '';
  guardando = false;

  mapaUrl: any = null;
  private apiUrl = 'https://baston-iot-backend.onrender.com';
  private horaInterval: any;

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router,
    private cd: ChangeDetectorRef,
      private sanitizer: DomSanitizer 

  ) {}

  ngOnInit() {
    this.actualizarHora();
    this.horaInterval = setInterval(() => {
      this.actualizarHora();
      this.cd.detectChanges();
    }, 1000);
    this.cargarDatos();
  }

  ngAfterViewInit() {
    
  }

  ngOnDestroy() {
    if (this.horaInterval) clearInterval(this.horaInterval);
  
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.storage.getToken()}`
    });
  }

  actualizarHora() {
    const now = new Date();
    this.horaActual = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

inicializarMapa() {
  

 
}


actualizarMapa(lat: number, lng: number) {
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
  this.mapaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  this.cd.detectChanges();
}

  cargarDatos() {
    const usuario = this.storage.getUsuario();
    if (!usuario) return;

    this.http.get<any[]>(`${this.apiUrl}/devices/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.baston = data.find(b => b.usuario_id === usuario.id);
          if (this.baston) {
            this.cargarLecturas();
            this.cargarBuzzer();
          }
          this.loading = false;
this.cd.detectChanges();                          // Angular muestra el div del mapa
if (this.baston) {
  setTimeout(() => this.inicializarMapa(), 0);    // Leaflet lo encuentra
}
        },
        error: err => {
          if (err.status === 401) this.router.navigate(['/login']);
          this.loading = false;
          this.cd.detectChanges();
        }
      });
  }

  cargarLecturas() {
    if (!this.baston?.sensor_gps) {
      this.http.get<any>(`${this.apiUrl}/devices/${this.baston.id}/`, { headers: this.getHeaders() })
        .subscribe({
          next: data => {
            this.baston = data;
            this.cd.detectChanges();
            if (data.sensor_gps) this.cargarGps(data.sensor_gps.id);
            if (data.sensor_distancia) this.cargarDistancia(data.sensor_distancia.id);
          },
          error: () => {}
        });
    } else {
      if (this.baston.sensor_gps) this.cargarGps(this.baston.sensor_gps.id);
      if (this.baston.sensor_distancia) this.cargarDistancia(this.baston.sensor_distancia.id);
    }
  }

  cargarGps(sensorId: number) {
    this.http.get<any[]>(`${this.apiUrl}/readings/gps/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.lecturasGps = data.filter(l => l.sensor === sensorId).slice(0, 5);
          if (this.lecturasGps.length > 0) {
            const ultima = this.lecturasGps[0];
            this.actualizarMapa(ultima.latitud, ultima.longitud);
          }
          this.cd.detectChanges();
        },
        error: () => {}
      });
  }

  cargarDistancia(sensorId: number) {
    this.http.get<any[]>(`${this.apiUrl}/readings/distancia/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          const lecturas = data.filter(l => l.sensor === sensorId);
          this.lecturaDistancia = lecturas.length > 0 ? lecturas[0] : null;
          this.cd.detectChanges();
        },
        error: () => {}
      });
  }

  cargarBuzzer() {
    this.http.get<any>(`${this.apiUrl}/commands/buzzer/${this.baston.id}/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.buzzer = data;
          this.cd.detectChanges();
        },
        error: () => {}
      });
  }

  hacerSonar() {
    this.guardando = true;
    this.cd.detectChanges();
    this.http.post(`${this.apiUrl}/commands/create/`, { tipo: 'BUZZER_ON', baston_id: this.baston.id }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.mensajeExito = '✅ Comando enviado';
          this.cargarBuzzer();
          setTimeout(() => { this.mensajeExito = ''; this.cd.detectChanges(); }, 3000);
          this.cd.detectChanges();
        },
        error: () => {
          this.guardando = false;
          this.mensajeError = '❌ Error al enviar comando';
          this.cd.detectChanges();
        }
      });
  }

  cerrarSesion() {
    this.storage.clear();
    this.router.navigate(['/login']);
  }
}