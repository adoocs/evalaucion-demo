import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)

  const token = auth.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    headers:  req.headers.append('Authorization', `Bearer ${token}`)
  });

  return next(authReq);
};
