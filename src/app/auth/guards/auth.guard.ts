import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { inject } from '@angular/core';

const checkAuthentication = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigateByUrl('/auth/login');
    return false;
  }
  return true;
};

export const authGuard: CanActivateFn = () => checkAuthentication();

export const authMatchGuard: CanMatchFn = () => checkAuthentication();
