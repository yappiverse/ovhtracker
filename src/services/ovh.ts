import { PLAN_CODES } from '../config'
import type { AvailablePlan, AvailabilityResult, Datacenter, StatusType } from '../types'

type OVHDatacenterResponse = {
  datacenters: Datacenter[]
}

export async function fetchPlanAvailability(
  apiBaseUrl: string,
  subsidiary: string,
  planCode: string
): Promise<AvailabilityResult> {
  try {
    const url = `${apiBaseUrl}/vps/order/rule/datacenter?ovhSubsidiary=${subsidiary}&planCode=${planCode}`
    const response = await fetch(url)
    
    if (!response.ok) {
      return { planCode, error: `Failed to fetch: ${response.statusText}` }
    }
    
    const data = await response.json() as OVHDatacenterResponse
    
    const availability = data.datacenters.map((dc) => ({
      datacenter: dc.datacenter,
      status: dc.status,
      linuxStatus: dc.linuxStatus,
      windowsStatus: dc.windowsStatus
    }))

    return { planCode, availability }
  } catch (error) {
    return { planCode, error: String(error) }
  }
}

// Check if a datacenter is available based on the configured status types
function isAvailable(dc: Datacenter, statusTypes: StatusType[]): { available: boolean; matchedTypes: StatusType[] } {
  const matchedTypes: StatusType[] = []
  
  for (const statusType of statusTypes) {
    const value = dc[statusType]
    if (value && value !== 'out-of-stock') {
      matchedTypes.push(statusType)
    }
  }
  
  return { 
    available: matchedTypes.length > 0, 
    matchedTypes 
  }
}

export async function checkAllPlansAvailability(
  apiBaseUrl: string,
  subsidiary: string,
  notifyRegions: string[],
  statusTypes: StatusType[]
): Promise<{
  results: AvailabilityResult[]
  availablePlans: AvailablePlan[]
}> {
  const notifyAll = notifyRegions.includes('ALL')
  const availablePlans: AvailablePlan[] = []

  const results = await Promise.all(
    PLAN_CODES.map(async (planCode) => {
      const result = await fetchPlanAvailability(apiBaseUrl, subsidiary, planCode)
      
      if (result.availability) {
        for (const dc of result.availability) {
          const { available, matchedTypes } = isAvailable(dc as Datacenter, statusTypes)
          
          if (available && (notifyAll || notifyRegions.includes(dc.datacenter))) {
            availablePlans.push({
              planCode,
              datacenter: {
                ...dc,
                matchedStatusTypes: matchedTypes
              } as Datacenter
            })
          }
        }
      }
      
      return result
    })
  )

  return { results, availablePlans }
}
