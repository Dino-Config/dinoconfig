import { SetMetadata } from '@nestjs/common';
import { Feature } from '../../features/enums/feature.enum';

export const REQUIRED_FEATURE_KEY = 'requiredFeature';
export const RequireFeature = (feature: Feature) => SetMetadata(REQUIRED_FEATURE_KEY, feature);


