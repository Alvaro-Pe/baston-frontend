import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../../core/services/storage';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalle-baston',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-baston.html',
  styleUrl: './detalle-baston.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetalleBaston implements OnInit {

  baston: any = null;
  lecturasGps: any[] = [];
  lecturasDistancia: any[] = [];
  comandos: any[] = [];
  buzzer: any = null;
  loading = true;

  mostrarFormSensorGps = false;
  mostrarFormSensorDistancia = false;
  mostrarFormComando = false;

  sensorGpsForm = { tipo: '' };
  sensorDistanciaForm = { tipo: '' };
  nuevoComando = { tipo: '' };

  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  private apiUrl = 'https://finalbaston-production.up.railway.app';
  private bastonId: number = 0;

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    public cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.bastonId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDetalle();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.storage.getToken()}`
    });
  }

  cargarDetalle() {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/devices/${this.bastonId}/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.baston = data;
          this.loading = false;
          this.cd.detectChanges();
          this.cargarLecturas();
          this.cargarComandos();
          this.cargarBuzzer();
        },
        error: err => {
          if (err.status === 401) this.router.navigate(['/login']);
          this.loading = false;
          this.cd.detectChanges();
        }
      });
  }

  cargarLecturas() {
    if (this.baston?.sensor_gps) {
      this.http.get<any[]>(`${this.apiUrl}/readings/gps/`, { headers: this.getHeaders() })
        .subscribe({
          next: data => {
            this.lecturasGps = data.filter(l => l.sensor === this.baston.sensor_gps.id).slice(0, 5);
            this.cd.detectChanges();
          },
          error: () => {}
        });
    }

    if (this.baston?.sensor_distancia) {
      this.http.get<any[]>(`${this.apiUrl}/readings/distancia/`, { headers: this.getHeaders() })
        .subscribe({
          next: data => {
            this.lecturasDistancia = data.filter(l => l.sensor === this.baston.sensor_distancia.id).slice(0, 5);
            this.cd.detectChanges();
          },
          error: () => {}
        });
    }
  }

 cargarComandos() {
  this.http.get<any[]>(`${this.apiUrl}/commands/baston/${this.bastonId}/`, { headers: this.getHeaders() })
    .subscribe({
      next: data => {
        this.comandos = data;
        this.cd.detectChanges();
      },
      error: () => {}
    });
}

cargarBuzzer() {
  this.http.get<any>(`${this.apiUrl}/commands/buzzer/${this.bastonId}/`, { headers: this.getHeaders() })
    .subscribe({
      next: data => {
        this.buzzer = data;
        this.cd.detectChanges();
      },
      error: () => {}
    });
}

  agregarSensorGps() {
    this.guardando = true;
    this.cd.detectChanges();
    this.http.post(`${this.apiUrl}/devices/${this.bastonId}/sensor-gps/`, this.sensorGpsForm, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.mostrarFormSensorGps = false;
          this.mensajeExito = '✅ Sensor GPS agregado';
          this.cargarDetalle();
          setTimeout(() => { this.mensajeExito = ''; this.cd.detectChanges(); }, 3000);
          this.cd.detectChanges();
        },
        error: (err) => {
          this.guardando = false;
          this.mensajeError = err.error?.error || '❌ Error al agregar sensor GPS';
          this.cd.detectChanges();
        }
      });
  }

  agregarSensorDistancia() {
    this.guardando = true;
    this.cd.detectChanges();
    this.http.post(`${this.apiUrl}/devices/${this.bastonId}/sensor-distancia/`, this.sensorDistanciaForm, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.mostrarFormSensorDistancia = false;
          this.mensajeExito = '✅ Sensor de distancia agregado';
          this.cargarDetalle();
          setTimeout(() => { this.mensajeExito = ''; this.cd.detectChanges(); }, 3000);
          this.cd.detectChanges();
        },
        error: (err) => {
          this.guardando = false;
          this.mensajeError = err.error?.error || '❌ Error al agregar sensor';
          this.cd.detectChanges();
        }
      });
  }

 enviarComando() {
  this.guardando = true;
  this.cd.detectChanges();
  this.http.post(`${this.apiUrl}/commands/create/`, { tipo: this.nuevoComando.tipo, baston_id: this.bastonId }, { headers: this.getHeaders() })
    .subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarFormComando = false;
        this.mensajeExito = '✅ Comando enviado';
        this.cargarComandos();
        this.cargarBuzzer(); // 👈 recargar buzzer
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

  volver() {
    this.router.navigate(['/bastones']);
  }
}