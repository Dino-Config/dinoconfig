import { environment as dev } from './environment';
import { environment as prod } from './environment.prod';

function getEnv() {
  return process.env.NODE_ENV === 'production' ? prod : dev;
}

export const environment = getEnv();