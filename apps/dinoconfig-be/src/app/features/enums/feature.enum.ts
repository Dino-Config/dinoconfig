/**
 * Available features in the system.
 * Each feature can be enabled/disabled based on subscription tier.
 */
export enum Feature {
  // Basic features
  BASIC_CONFIGS = 'basic_configs',
  BASIC_SDK = 'basic_sdk',
  
  // Advanced configuration features
  MULTIPLE_CONFIGS = 'multiple_configs',
  UNLIMITED_CONFIGS = 'unlimited_configs',
  CONFIG_VERSIONING = 'config_versioning',
  CONFIG_ROLLBACK = 'config_rollback',
  
  // Brand management
  MULTIPLE_BRANDS = 'multiple_brands',
  UNLIMITED_BRANDS = 'unlimited_brands',
  
  // API and SDK features
  ADVANCED_SDK = 'advanced_sdk',
  WEBHOOKS = 'webhooks',
  API_RATE_LIMIT_INCREASED = 'api_rate_limit_increased',
  
  // Targeting and segmentation
  ADVANCED_TARGETING = 'advanced_targeting',
  USER_SEGMENTATION = 'user_segmentation',
  AB_TESTING = 'ab_testing',
  
  // Analytics and monitoring
  ANALYTICS = 'analytics',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  AUDIT_LOGS = 'audit_logs',
  
  // Collaboration
  TEAM_COLLABORATION = 'team_collaboration',
  ROLE_BASED_ACCESS = 'role_based_access',
  
  // Support
  PRIORITY_SUPPORT = 'priority_support',
  DEDICATED_SUPPORT = 'dedicated_support',
  
  // Custom features
  CUSTOM_INTEGRATIONS = 'custom_integrations',
  SSO = 'sso',
  SLA = 'sla',
}

