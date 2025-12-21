import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';
import { UserStateService } from '../services/user-state.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authState = inject(AuthStateService);
  const userState = inject(UserStateService);

  const isValid = await authState.validate();
  if (!isValid) {
    return router.parseUrl('/signin');
  }

  if (!userState.isUserLoaded()) {
    await userState.loadUser();
  }

  const user = userState.user();

  if (!user) {
    return router.parseUrl('/signin');
  }

  if (!user.emailVerified) {
    if (!state.url.includes('/verify-email')) {
      return router.parseUrl('/verify-email');
    }
    return true;
  }

  if (user.emailVerified && state.url.includes('/verify-email')) {
    return router.parseUrl('/brands');
  }

  return true;
};
