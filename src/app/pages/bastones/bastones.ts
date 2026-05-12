import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../core/services/storage';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bastones',
  imports: [CommonModule, FormsModule],
  templateUrl: './bastones.html',
  styleUrl: './bastones.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Bastones implements OnInit {

  bastones: any[] = [];
  usuarios: any[] = [];
  filtro = '';
  mostrarFormulario = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

 nuevoBaston = {
  nombre: '',
  estado: 'activo',
  usuario_id: ''
};

  private apiUrl = 'https://baston-iot-backend.onrender.com';

constructor(
  private http: HttpClient,
  private storage: StorageService,
  private authService: AuthService,
  private cd: ChangeDetectorRef,
  private router: Router
) {}

  ngOnInit() {
    this.cargarBastones();
    this.cargarUsuarios();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.storage.getToken()}`
    });
  }

cargarBastones() {
  this.http.get<any[]>(`${this.apiUrl}/devices/`, { headers: this.getHeaders() })
    .subscribe({
      next: data => { 
        this.bastones = data; 
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) this.authService.logout();
      }
    });
}

cargarUsuarios() {
  this.http.get<any[]>(`${this.apiUrl}/users/sin-baston/`, { headers: this.getHeaders() })
    .subscribe({
      next: data => { 
        this.usuarios = data; 
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) this.authService.logout();
      }
    });
}
  bastonesFiltrados() {
    if (!this.filtro) return this.bastones;
    const f = this.filtro.toLowerCase();
    return this.bastones.filter(b =>
      b.nombre.toLowerCase().includes(f) ||
      (b.usuario_nombre && b.usuario_nombre.toLowerCase().includes(f))
    );
  }

 verDetalle(baston: any) {
  this.router.navigate(['/bastones', baston.id]);
}

  editarBaston(baston: any) {
    console.log('editar:', baston);
  }

 cerrarFormulario() {
  this.mostrarFormulario = false;
  this.mensajeExito = '';
  this.mensajeError = '';
  this.nuevoBaston = { nombre: '', estado: 'activo', usuario_id: '' };
}

guardarBaston() {
  this.guardando = true;
  this.mensajeError = '';
  this.cd.detectChanges();

  this.http.post(`${this.apiUrl}/devices/crear/`, this.nuevoBaston, { headers: this.getHeaders() })
    .subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = '✅ Bastón creado exitosamente';
        this.cd.detectChanges();
        this.cargarBastones();
         this.cargarUsuarios();
        setTimeout(() => {
          this.cerrarFormulario();
          this.cd.detectChanges();
        }, 1500);
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = '❌ Error al crear el bastón';
        this.cd.detectChanges();
      }
    });
}

editandoBaston: any = null;
mostrarEditar = false;

bastonEditForm = {
  nombre: '',
  estado: 'activo'
};

abrirEditar(baston: any) {
  this.editandoBaston = baston;
  this.bastonEditForm = {
    nombre: baston.nombre,
    estado: baston.estado
  };
  this.mostrarEditar = true;
  this.cd.detectChanges();
}

cerrarEditar() {
  this.mostrarEditar = false;
  this.editandoBaston = null;
  this.mensajeError = '';
  this.cd.detectChanges();
}

guardarEdicion() {
  this.guardando = true;
  this.cd.detectChanges();

  this.http.put(`${this.apiUrl}/devices/${this.editandoBaston.id}/editar/`, this.bastonEditForm, { headers: this.getHeaders() })
    .subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = '✅ Bastón actualizado correctamente';
        this.cargarBastones();
        setTimeout(() => this.cerrarEditar(), 1500);
        this.cd.detectChanges();
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = '❌ Error al actualizar el bastón';
        this.cd.detectChanges();
      }
    });
}
  
}