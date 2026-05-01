import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../core/services/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auditoria',
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Auditoria implements OnInit {

  auditorias: any[] = [];
  auditoriasFiltradas: any[] = [];
  filtro = '';
  private apiUrl = 'https://finalbaston-production.up.railway.app';

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarAuditoria();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.storage.getToken()}`
    });
  }

  cargarAuditoria() {
    this.http.get<any[]>(`${this.apiUrl}/users/auditoria/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.auditorias = data;
          this.auditoriasFiltradas = [...data];
          this.cd.detectChanges();
        },
        error: err => {
          if (err.status === 401) this.router.navigate(['/login']);
        }
      });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.auditoriasFiltradas = this.auditorias.filter(a =>
      a.accion.toLowerCase().includes(f) ||
      (a.descripcion && a.descripcion.toLowerCase().includes(f))
    );
    this.cd.detectChanges();
  }
}