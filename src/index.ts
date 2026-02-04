import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/check-availability', async (c) => {
  const planCodes = [
    'vps-2025-model1',
    'vps-2025-model2', 
    'vps-2025-model3', 
    'vps-2025-model4', 
    'vps-2025-model5', 
    'vps-2025-model6'
  ]

  const results = await Promise.all(planCodes.map(async (planCode) => {
    try {
      const response = await fetch(`https://ca.api.ovh.com/v1/vps/order/rule/datacenter?ovhSubsidiary=WE&planCode=${planCode}`)
      if (!response.ok) {
         return { planCode, error: `Failed to fetch: ${response.statusText}` }
      }
      const data = await response.json() as { datacenters: any[] }
      
      const availability = data.datacenters.map((dc: any) => ({
        datacenter: dc.datacenter,
        status: dc.status,
        linuxStatus: dc.linuxStatus,
        windowsStatus: dc.windowsStatus
      }))

      return {
        planCode,
        availability
      }
    } catch (error) {
       return { planCode, error: String(error) }
    }
  }))

  return c.json(results)
})

export default app
