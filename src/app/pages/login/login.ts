import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { StorageService } from '../../core/services/storage';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  error = '';
  exito = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
     private storage: StorageService
  ) {}

  iniciarSesion() {
  this.error = '';
  this.exito = '';
  this.cargando = true;

  this.authService.login(this.username, this.password).subscribe({
    next: () => {
      // obtener perfil del usuario
      this.authService.obtenerPerfil().subscribe({
        next: (perfil) => {
          this.storage.setUsuario(perfil);
          this.cargando = false;
          this.exito = '✅ Credenciales correctas, ingresando...';
          this.cd.detectChanges();

          setTimeout(() => {
  const rol = this.storage.getRol();
  if (rol === 'admin' || rol === 'administrador') {
    this.router.navigate(['/dashboard']);
  } else if (rol === 'usuario') {
    this.router.navigate(['/mi-baston']);
  } else {
    this.cargando = false;
    this.storage.clear();
    this.error = '❌ Tu cuenta no tiene un rol asignado. Contacta al administrador.';
    this.cd.detectChanges();
  }
}, 1500);
        },
        error: () => {
          this.cargando = false;
          this.error = '❌ Error al obtener perfil';
          this.cd.detectChanges();
        }
      });
    },
    error: () => {
      this.cargando = false;
      this.error = '❌ Usuario o contraseña incorrectos';
      this.cd.detectChanges();
    }
  });
}
}