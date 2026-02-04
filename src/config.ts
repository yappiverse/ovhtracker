export const PLAN_CODES = [
  'vps-2025-model1',
  'vps-2025-model2',
  'vps-2025-model3',
  'vps-2025-model4',
  'vps-2025-model5',
  'vps-2025-model6'
] as const

// Required environment variables
export const REQUIRED_ENV_VARS = [
  'RESEND_API',
  'EMAIL_RECIPIENT',
  'EMAIL_SENDER',
  'OVH_API_BASE_URL',
  'OVH_SUBSIDIARY',
  'NOTIFY_REGIONS',
  'NOTIFY_STATUS_TYPES'
] as const
