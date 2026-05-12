import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../core/services/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {

  totalBastones = 0;
  totalUsuarios = 0;

  private apiUrl = 'https://baston-iot-backend.onrender.com';

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.storage.getToken()}`
    });
  }

  cargarDatos() {
    this.http.get<any[]>(`${this.apiUrl}/devices/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.totalBastones = data.length;
          this.cd.detectChanges();
        },
        error: err => {
          if (err.status === 401) this.router.navigate(['/login']);
        }
      });

    this.http.get<any[]>(`${this.apiUrl}/users/listar/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.totalUsuarios = data.length;
          this.cd.detectChanges();
        },
        error: err => {
          if (err.status === 401) this.router.navigate(['/login']);
        }
      });
  }
}