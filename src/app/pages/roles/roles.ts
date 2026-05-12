import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../core/services/storage';
import { Router } from '@angular/router';

type TabVista = 'roles' | 'recursos' | 'usuariosRoles' | 'permisos';

@Component({
  selector: 'app-roles',
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Roles implements OnInit {

  tabActiva: TabVista = 'roles';
  private apiUrl = 'https://baston-iot-backend.onrender.com';

  roles: any[] = [];
  recursos: any[] = [];
  usuarios: any[] = [];
  usuariosRoles: any[] = [];
  rolesRecursos: any[] = [];

  rolesFiltrados: any[] = [];
  recursosFiltrados: any[] = [];

  loading = false;
  saving = false;
  mensajeExito = '';
  mensajeError = '';

  filtroRoles = '';
  filtroRecursos = '';

  modalRolVisible = false;
  modalRecursoVisible = false;
  modoEdicionRol = false;
  modoEdicionRecurso = false;
  rolSeleccionado: any = null;
  recursoSeleccionado: any = null;
  usuariosFiltrados: any[] = [];

  filtroUsuarios = '';

filtrarUsuarios() {
  const f = this.filtroUsuarios.toLowerCase();
  this.usuariosFiltrados = this.usuarios.filter(u =>
    u.username.toLowerCase().includes(f) ||
    (u.first_name && u.first_name.toLowerCase().includes(f)) ||
    (u.last_name && u.last_name.toLowerCase().includes(f))
  );
  this.cd.detectChanges();
}

  rolForm = { nombre: '', estado: true };
recursoForm = { nombre: '', url_backend: '', url_frontend: '', path: '', orden: '1', estado: 'activo', recurso_padre: '' };
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

  manejarError(err: any) {
    if (err.status === 401) this.router.navigate(['/login']);
  }

  cargarDatos() {
    this.loading = true;

    this.http.get<any[]>(`${this.apiUrl}/users/roles/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.roles = data;
          this.rolesFiltrados = [...data];
          this.loading = false;
          this.cd.detectChanges();
        },
        error: err => this.manejarError(err)
      });

    this.http.get<any[]>(`${this.apiUrl}/users/recursos/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.recursos = data;
          this.recursosFiltrados = [...data];
          this.cd.detectChanges();
        },
        error: err => this.manejarError(err)
      });

   this.http.get<any[]>(`${this.apiUrl}/users/listar/`, { headers: this.getHeaders() })
  .subscribe({
    next: data => {
      this.usuarios = [...data];
      this.usuariosFiltrados = [...data];
      this.cd.detectChanges();
    },
    error: err => this.manejarError(err)
  });

    this.http.get<any[]>(`${this.apiUrl}/users/usuario-rol/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.usuariosRoles = [...data];
          this.cd.detectChanges();
        },
        error: err => this.manejarError(err)
      });

    this.http.get<any[]>(`${this.apiUrl}/users/rol-recurso/`, { headers: this.getHeaders() })
      .subscribe({
        next: data => {
          this.rolesRecursos = [...data];
          this.cd.detectChanges();
        },
        error: err => this.manejarError(err)
      });
  }

  cambiarTab(tab: TabVista) {
    this.tabActiva = tab;
    this.cd.detectChanges();
  }

  filtrarRoles() {
    const f = this.filtroRoles.toLowerCase();
    this.rolesFiltrados = this.roles.filter(r => r.nombre.toLowerCase().includes(f));
    this.cd.detectChanges();
  }

  filtrarRecursos() {
    const f = this.filtroRecursos.toLowerCase();
    this.recursosFiltrados = this.recursos.filter(r => r.nombre.toLowerCase().includes(f));
    this.cd.detectChanges();
  }

  abrirModalCrearRol() {
    this.modoEdicionRol = false;
    this.rolForm = { nombre: '', estado: true };
    this.modalRolVisible = true;
    this.cd.detectChanges();
  }

  abrirModalEditarRol(rol: any) {
    this.modoEdicionRol = true;
    this.rolSeleccionado = rol;
    this.rolForm = { nombre: rol.nombre, estado: rol.estado };
    this.modalRolVisible = true;
    this.cd.detectChanges();
  }

  cerrarModalRol() {
    this.modalRolVisible = false;
    this.mensajeError = '';
    this.cd.detectChanges();
  }

  guardarRol() {
    if (!this.rolForm.nombre.trim()) {
      this.mensajeError = 'El nombre es obligatorio';
      this.cd.detectChanges();
      return;
    }
    this.saving = true;
    this.mensajeError = '';
    this.cd.detectChanges();

    const url = this.modoEdicionRol
      ? `${this.apiUrl}/users/roles/${this.rolSeleccionado.id}/editar/`
      : `${this.apiUrl}/users/roles/crear/`;
    const method = this.modoEdicionRol ? 'put' : 'post';

    this.http[method](url, this.rolForm, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.saving = false;
        this.cerrarModalRol();
        this.cargarDatos();
        this.mensajeExito = '✅ Rol guardado correctamente';
        setTimeout(() => { this.mensajeExito = ''; this.cd.detectChanges(); }, 3000);
        this.cd.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.mensajeError = '❌ Error al guardar el rol';
        this.manejarError(err);
        this.cd.detectChanges();
      }
    });
  }

  eliminarRol(rol: any) {
    if (!confirm(`¿Eliminar el rol "${rol.nombre}"?`)) return;
    this.http.delete(`${this.apiUrl}/users/roles/${rol.id}/eliminar/`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.roles = this.roles.filter(r => r.id !== rol.id);
          this.rolesFiltrados = this.rolesFiltrados.filter(r => r.id !== rol.id);
          this.mensajeExito = '✅ Rol eliminado';
          setTimeout(() => { this.mensajeExito = ''; this.cd.detectChanges(); }, 3000);
          this.cd.detectChanges();
        },
        error: (err) => {
          this.mensajeError = '❌ Error al eliminar';
          this.manejarError(err);
          this.cd.detectChanges();
        }
      });
  }

  abrirModalCrearRecurso() { 
  this.modoEdicionRecurso = false; 
  this.recursoForm = { nombre: '', url_backend: '', url_frontend: '', path: '', orden: '1', estado: 'activo', recurso_padre: '' }; 
  this.modalRecursoVisible = true;
  this.cd.detectChanges();
}

  abrirModalEditarRecurso(recurso: any) {
    this.modoEdicionRecurso = true;
    this.recursoSeleccionado = recurso;
    this.recursoForm = { ...recurso };
    this.modalRecursoVisible = true;
    this.cd.detectChanges();
  }

  cerrarModalRecurso() {
    this.modalRecursoVisible = false;
    this.mensajeError = '';
    this.cd.detectChanges();
  }

  guardarRecurso() {
    this.saving = true;
    this.cd.detectChanges();

    const url = this.modoEdicionRecurso
      ? `${this.apiUrl}/users/recursos/${this.recursoSeleccionado.id}/editar/`
      : `${this.apiUrl}/users/recursos/crear/`;
    const method = this.modoEdicionRecurso ? 'put' : 'post';

    this.http[method](url, this.recursoForm, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.saving = false;
        this.cerrarModalRecurso();
        this.cargarDatos();
        this.mensajeExito = 'Recurso guardado correctamente';
        setTimeout(() => { this.mensajeExito = ''; this.cd.detectChanges(); }, 3000);
        this.cd.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.mensajeError = 'Error al guardar el recurso';
        this.cd.detectChanges();
      }
    });
  }

  eliminarRecurso(recurso: any) {
    if (!confirm(`¿Eliminar el recurso "${recurso.nombre}"?`)) return;
    this.http.delete(`${this.apiUrl}/users/recursos/${recurso.id}/eliminar/`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.recursos = this.recursos.filter(r => r.id !== recurso.id);
          this.recursosFiltrados = this.recursosFiltrados.filter(r => r.id !== recurso.id);
          this.mensajeExito = '✅ Recurso eliminado';
          setTimeout(() => { this.mensajeExito = ''; this.cd.detectChanges(); }, 3000);
          this.cd.detectChanges();
        },
        error: (err) => {
          this.mensajeError = '❌ Error al eliminar';
          this.manejarError(err);
          this.cd.detectChanges();
        }
      });
  }

  usuarioTieneRol(usuarioId: number, rolId: number): boolean {
    return this.usuariosRoles.some(r => r.usuario === usuarioId && r.rol === rolId);
  }

  toggleRolUsuario(usuario: any, rol: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.http.post(`${this.apiUrl}/users/usuario-rol/crear/`, { usuario: usuario.id, rol: rol.id }, { headers: this.getHeaders() })
        .subscribe({ next: () => { this.cargarDatos(); this.cd.detectChanges(); }, error: () => {} });
    } else {
      const relacion = this.usuariosRoles.find(r => r.usuario === usuario.id && r.rol === rol.id);
      if (relacion) {
        this.http.delete(`${this.apiUrl}/users/usuario-rol/${relacion.id}/eliminar/`, { headers: this.getHeaders() })
          .subscribe({ next: () => { this.cargarDatos(); this.cd.detectChanges(); }, error: () => {} });
      }
    }
  }

  rolTieneRecurso(rolId: number, recursoId: number): boolean {
    return this.rolesRecursos.some(r => r.rol === rolId && r.recurso === recursoId);
  }

  toggleRecursoRol(rol: any, recurso: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.http.post(`${this.apiUrl}/users/rol-recurso/crear/`, { rol: rol.id, recurso: recurso.id }, { headers: this.getHeaders() })
        .subscribe({ next: () => { this.cargarDatos(); this.cd.detectChanges(); }, error: () => {} });
    } else {
      const relacion = this.rolesRecursos.find(r => r.rol === rol.id && r.recurso === recurso.id);
      if (relacion) {
        this.http.delete(`${this.apiUrl}/users/rol-recurso/${relacion.id}/eliminar/`, { headers: this.getHeaders() })
          .subscribe({ next: () => { this.cargarDatos(); this.cd.detectChanges(); }, error: () => {} });
      }
    }
  }

  totalUsuariosConRol(): number {
    return new Set(this.usuariosRoles.map(r => r.usuario)).size;
  }
}