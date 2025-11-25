import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';
import { firstValueFrom } from 'rxjs';

export const emailVerificationGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  try {
    const user = await firstValueFrom(userService.getUser());
    
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

