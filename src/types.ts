export type Bindings = {
  RESEND_API: string
  EMAIL_RECIPIENT: string
  EMAIL_SENDER: string
  OVH_API_BASE_URL: string
  OVH_SUBSIDIARY: string
  NOTIFY_REGIONS: string
  NOTIFY_STATUS_TYPES: string
}

export type StatusType = 'status' | 'linuxStatus' | 'windowsStatus'

export type Datacenter = {
  datacenter: string
  status: string
  linuxStatus?: string
  windowsStatus?: string
  matchedStatusTypes?: StatusType[]
  [key: string]: any
}

export type AvailablePlan = {
  planCode: string
  datacenter: Datacenter
}

export type AvailabilityResult = {
  planCode: string
  availability?: {
    datacenter: string
    status: string
    linuxStatus?: string
    windowsStatus?: string
  }[]
  error?: string
}
