import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageService } from './storage';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://finalbaston-production.up.railway.app';

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router
  ) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/token/`, {
      username,
      password
    }).pipe(
      tap(response => {
        this.storage.setToken(response.access);
        this.storage.setRefreshToken(response.refresh);
      })
    );
  }

  renovarToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/token/refresh/`, {
      refresh: this.storage.getRefreshToken()
    }).pipe(
      tap(response => {
        this.storage.setToken(response.access);
      })
    );
  }

  logout(): void {
    this.storage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.storage.isAuthenticated();
  }

  obtenerPerfil(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/users/perfil/`, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${this.storage.getToken()}`
    })
  });
}
}