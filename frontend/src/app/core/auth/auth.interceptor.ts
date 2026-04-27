import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getAuthToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthRoute = req.url.includes('/auth/');

      if (err.status === 403 && !isAuthRoute) {
        if (router.url !== '/403') {
          router.navigate(['/403']);
        }
        return throwError(() => err);
      }

      if (err.status === 401 && !isAuthRoute && !isRefreshing) {
        isRefreshing = true;

        return auth.refresh().pipe(
          switchMap(() => {
            isRefreshing = false;
            const refreshedToken = auth.getAuthToken();
            const retried = refreshedToken
              ? req.clone({ setHeaders: { Authorization: 'Bearer ' + refreshedToken } })
              : req;
            return next(retried);
          }),
          catchError((refreshErr) => {
            isRefreshing = false;
            auth.clearSession();
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          }),
        );
      }

      return throwError(() => err);
    }),
  );
};