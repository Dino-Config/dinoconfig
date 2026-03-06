export interface User {
  id: number;
  auth0Id: string;
  status?: 'active' | 'closed' | 'suspended' | 'deleted';
  deletedAt?: string;
  deletionScheduledAt?: string;
  restoreToken?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isActive: boolean;
  emailVerified: boolean;
  verificationEmailResendCount: number;
  companyName?: string;
  createdAt: Date;
  brands: Brand[];
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  createdAt?: string;
}

