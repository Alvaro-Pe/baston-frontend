import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../core/services/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Usuarios implements OnInit {

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  roles: any[] = [];
  filtro = '';
  filtroEstado = 'todos';
  mostrarFormulario = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  nuevoUsuario = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    celular: '',
    rol_id: ''
  };

  private apiUrl = 'https://baston-iot-backend.onrender.com';

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.storage.getToken()}`
    });
  }

  cargarUsuarios() {
    this.http.get<any[]>(`${this.apiUrl}/users/listar/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.usuarios = data;
          this.aplicarFiltros();
          this.cd.detectChanges();
        },
        error: err => {
          if (err.status === 401) this.router.navigate(['/login']);
        }
      });
  }

  cargarRoles() {
    this.http.get<any[]>(`${this.apiUrl}/users/roles/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.roles = data;
          this.cd.detectChanges();
        },
        error: () => {}
      });
  }

  aplicarFiltros() {
    let resultado = this.usuarios;
    if (this.filtro) {
      const f = this.filtro.toLowerCase();
      resultado = resultado.filter(u =>
        u.username.toLowerCase().includes(f) ||
        (u.first_name && u.first_name.toLowerCase().includes(f)) ||
        (u.last_name && u.last_name.toLowerCase().includes(f))
      );
    }
    if (this.filtroEstado !== 'todos') {
      const activo = this.filtroEstado === 'activo';
      resultado = resultado.filter(u => u.is_active === activo);
    }
    this.usuariosFiltrados = resultado;
    this.cd.detectChanges();
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.cd.detectChanges();
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.nuevoUsuario = { username: '', first_name: '', last_name: '', email: '', password: '', celular: '', rol_id: '' };
    this.cd.detectChanges();
  }

  guardarUsuario() {
    if (!this.nuevoUsuario.username || !this.nuevoUsuario.password) {
      this.mensajeError = 'Username y contraseña son obligatorios';
      this.cd.detectChanges();
      return;
    }
    this.guardando = true;
    this.cd.detectChanges();

    this.http.post<any>(`${this.apiUrl}/users/registrar/`, this.nuevoUsuario, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          if (this.nuevoUsuario.rol_id && response.id) {
            this.http.post(`${this.apiUrl}/users/usuario-rol/crear/`, 
              { usuario: response.id, rol: this.nuevoUsuario.rol_id }, 
              { headers: this.getHeaders() }
            ).subscribe();
          }
          this.guardando = false;
          this.mensajeExito = '✅ Usuario creado exitosamente';
          this.cargarUsuarios();
          setTimeout(() => this.cerrarFormulario(), 1500);
          this.cd.detectChanges();
        },
       error: (err) => {
  this.guardando = false;

  // Intentar leer el mensaje de Django
  if (err.error) {
    if (err.error.username) {
      this.mensajeError = '❌ El username ya está registrado';
    } else if (err.error.email) {
      this.mensajeError = '❌ El email ya está en uso';
    } else if (err.error.detail) {
      this.mensajeError = `❌ ${err.error.detail}`;
    } else {
      // Tomar el primer mensaje que devuelva Django
      const primerCampo = Object.keys(err.error)[0];
      const primerMensaje = err.error[primerCampo];
      this.mensajeError = `❌ ${primerCampo}: ${Array.isArray(primerMensaje) ? primerMensaje[0] : primerMensaje}`;
    }
  } else {
    this.mensajeError = '❌ Error al crear el usuario';
  }

  this.cd.detectChanges();
}
      });
  }

  editandoUsuario: any = null;
mostrarEditar = false;

usuarioEditForm = {
  first_name: '',
  last_name: '',
  email: '',
  is_active: true,
  celular: '',
  rol_id: ''
};

abrirEditar(usuario: any) {
  this.editandoUsuario = usuario;
  this.usuarioEditForm = {
    first_name: usuario.first_name || '',
    last_name: usuario.last_name || '',
    email: usuario.email || '',
    is_active: usuario.is_active,
    celular: usuario.celular || '',
    rol_id: ''
  };
  this.mostrarEditar = true;
  this.cd.detectChanges();
}

cerrarEditar() {
  this.mostrarEditar = false;
  this.editandoUsuario = null;
  this.mensajeError = '';
  this.cd.detectChanges();
}

guardarEdicion() {
  this.guardando = true;
  this.cd.detectChanges();

  const payload = {
    ...this.usuarioEditForm,
    is_active: this.usuarioEditForm.is_active === true || this.usuarioEditForm.is_active as any === 'true'
  };

  this.http.put(`${this.apiUrl}/users/${this.editandoUsuario.id}/editar/`, payload, { headers: this.getHeaders() })
    .subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = '✅ Usuario actualizado correctamente';
        this.cargarUsuarios();
        setTimeout(() => this.cerrarEditar(), 1500);
        this.cd.detectChanges();
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = '❌ Error al actualizar el usuario';
        this.cd.detectChanges();
      }
    });
}
}