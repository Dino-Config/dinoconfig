import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserStateService } from '../services/user-state.service';

export const emailVerificationGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const userState = inject(UserStateService);

  try {
    // Only load user if not already loaded (preflight should have done this)
    // Don't force refresh - use existing state
    if (!userState.isUserLoaded()) {
      await userState.loadUser();
    }
    const user = userState.user();
    
    if (user && !user.emailVerified) {
      if (!state.url.includes('/verify-email')) {
        router.navigate(['/verify-email'], { replaceUrl: true });
        return false;
      }
      return true;
    }
    
    if (user?.emailVerified && state.url.includes('/verify-email')) {
      router.navigate(['/brands'], { replaceUrl: true });
      return false;
    }
    
    return true;
  } catch (error) {
    return true;
  }
};

