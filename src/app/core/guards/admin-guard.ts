import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage';

export const adminGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const router = inject(Router);

  if (!storage.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (!storage.isAdmin()) {
    router.navigate(['/mi-baston']);
    return false;
  }

  return true;
};