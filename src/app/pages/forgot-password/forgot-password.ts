import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPassword {

  email = '';
  mensaje = '';
  error = '';
  cargando = false;
  private apiUrl = 'https://baston-iot-backend.onrender.com';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  enviarSolicitud() {
    if (!this.email) {
      this.error = 'Ingresa tu email';
      this.cd.detectChanges();
      return;
    }
    this.cargando = true;
    this.error = '';
    this.cd.detectChanges();

    this.http.post(`${this.apiUrl}/users/solicitar-reset/`, { email: this.email })
      .subscribe({
        next: () => {
          this.cargando = false;
          this.mensaje = '✅ Si el email existe recibirás un correo con las instrucciones';
          this.cd.detectChanges();
        },
        error: () => {
          this.cargando = false;
          this.error = '❌ Error al enviar el correo';
          this.cd.detectChanges();
        }
      });
  }

  volver() {
    this.router.navigate(['/login']);
  }
}