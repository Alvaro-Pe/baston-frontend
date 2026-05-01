import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage';

export const userGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const router = inject(Router);

  if (!storage.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (storage.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};