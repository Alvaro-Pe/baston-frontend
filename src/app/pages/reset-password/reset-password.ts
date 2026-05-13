import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPassword implements OnInit {

  password = '';
  confirmar = '';
  mensaje = '';
  error = '';
  cargando = false;
  token = '';
  private apiUrl = 'https://baston-iot-backend.onrender.com';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error = 'Token inválido';
      this.cd.detectChanges();
    }
  }

  resetear() {
    if (!this.password || !this.confirmar) {
      this.error = 'Completa todos los campos';
      this.cd.detectChanges();
      return;
    }
    if (this.password !== this.confirmar) {
      this.error = 'Las contraseñas no coinciden';
      this.cd.detectChanges();
      return;
    }
    this.cargando = true;
    this.error = '';
    this.cd.detectChanges();

    this.http.post(`${this.apiUrl}/users/resetear-password/`, {
      token: this.token,
      password: this.password
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.mensaje = '✅ Contraseña actualizada correctamente';
        this.cd.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.error || '❌ Error al actualizar la contraseña';
        this.cd.detectChanges();
      }
    });
  }
}