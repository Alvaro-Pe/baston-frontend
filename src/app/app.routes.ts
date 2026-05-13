import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { MainLayout } from './layout/main-layout/main-layout';
import { UserLayout } from './layout/user-layout/user-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Bastones } from './pages/bastones/bastones';
import { Usuarios } from './pages/usuarios/usuarios';
import { Auditoria } from './pages/auditoria/auditoria';
import { Roles } from './pages/roles/roles';
import { DetalleBaston } from './pages/bastones/detalle-baston/detalle-baston';
import { authGuard } from './core/guards/auth-guard';
import { MiBaston } from './pages/mi-baston/mi-baston';
import { adminGuard } from './core/guards/admin-guard';
import { userGuard } from './core/guards/user-guard';
import { ResetPassword } from './pages/reset-password/reset-password';
import { ForgotPassword } from './pages/forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
{ path: 'reset-password', component: ResetPassword },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'bastones', component: Bastones },
      { path: 'bastones/:id', component: DetalleBaston },
      { path: 'usuarios', component: Usuarios },
      { path: 'auditoria', component: Auditoria },
      { path: 'roles', component: Roles },
    ]
  },
  {
  path: '',
  component: UserLayout,
  canActivate: [authGuard],
  children: [
    { path: 'mi-baston', component: MiBaston, canActivate: [userGuard] },
  ]
}
];