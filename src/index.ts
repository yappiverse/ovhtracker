import { Hono } from 'hono'
import { validateEnv } from './env'
import { checkAllPlansAvailability } from './services/ovh'
import { sendAvailabilityNotification } from './services/notification'
import type { Bindings, StatusType } from './types'

const app = new Hono<{ Bindings: Bindings }>()

const VALID_STATUS_TYPES: StatusType[] = ['status', 'linuxStatus', 'windowsStatus']

// Validate environment variables on every request
app.use('*', async (c, next) => {
  validateEnv(c.env)
  await next()
})

app.get('/', (c) => {
  return c.json({ 
    message: 'OVH VPS Tracker',
    status: 'running'
  })
})

// Scheduled handler for cron jobs
async function scheduled(event: { scheduledTime: number }, env: Bindings) {
  validateEnv(env)

  const notifyRegions = env.NOTIFY_REGIONS
    .split(',')
    .map(r => r.trim().toUpperCase())

  const statusTypes = env.NOTIFY_STATUS_TYPES
    .split(',')
    .map(s => s.trim() as StatusType)
    .filter(s => VALID_STATUS_TYPES.includes(s))

  console.log(`[CRON] Running scheduled check at ${new Date(event.scheduledTime).toISOString()}`)

  const { availablePlans } = await checkAllPlansAvailability(
    env.OVH_API_BASE_URL,
    env.OVH_SUBSIDIARY,
    notifyRegions,
    statusTypes
  )

  const { emailSent } = await sendAvailabilityNotification(
    env.RESEND_API,
    env.EMAIL_RECIPIENT,
    env.EMAIL_SENDER,
    availablePlans
  )

  console.log(`[CRON] Check complete. Found ${availablePlans.length} available plans. Email sent: ${emailSent}`)
}

export default {
  fetch: app.fetch,
  scheduled
}
