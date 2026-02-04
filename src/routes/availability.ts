import { Hono } from 'hono'
import { checkAllPlansAvailability } from '../services/ovh'
import { sendAvailabilityNotification } from '../services/notification'
import type { Bindings, StatusType } from '../types'

const availability = new Hono<{ Bindings: Bindings }>()

const VALID_STATUS_TYPES: StatusType[] = ['status', 'linuxStatus', 'windowsStatus']

availability.get('/check-availability', async (c) => {
  const notifyRegions = c.env.NOTIFY_REGIONS
    .split(',')
    .map(r => r.trim().toUpperCase())

  const statusTypes = c.env.NOTIFY_STATUS_TYPES
    .split(',')
    .map(s => s.trim() as StatusType)
    .filter(s => VALID_STATUS_TYPES.includes(s))

  const { results, availablePlans } = await checkAllPlansAvailability(
    c.env.OVH_API_BASE_URL,
    c.env.OVH_SUBSIDIARY,
    notifyRegions,
    statusTypes
  )

  const { emailSent, emailResponse } = await sendAvailabilityNotification(
    c.env.RESEND_API,
    c.env.EMAIL_RECIPIENT,
    c.env.EMAIL_SENDER || 'OVH Tracker <noreply@lmpt.in>',
    availablePlans
  )

  // return c.json({ 
  //   results, 
  //   emailSent, 
  //   emailResponse, 
  //   availablePlans, 
  //   notifyRegions,
  //   statusTypes
  // })
  return c.json({
    message: 'Availability checked successfully',
    status: 'success'
  }, 200)
})

export default availability
