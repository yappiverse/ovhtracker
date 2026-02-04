import { Resend } from 'resend'
import { generateEmailBody } from '../email'
import type { AvailablePlan } from '../types'

export type EmailResult = {
  emailSent: boolean
  emailResponse: any
}

export async function sendAvailabilityNotification(
  resendApiKey: string,
  recipient: string,
  sender: string,
  availablePlans: AvailablePlan[]
): Promise<EmailResult> {
  if (availablePlans.length === 0) {
    console.log('No available plans found matching criteria, skipping email.')
    return { emailSent: false, emailResponse: null }
  }

  console.log('Attempting to send email...')
  const resend = new Resend(resendApiKey)
  const emailBody = generateEmailBody(availablePlans)

  const emailOptions = {
    from: sender,
    to: recipient,
    subject: '🚀 OVH VPS Available!',
    html: emailBody
  }

  try {
    console.log('Sending email with options:', JSON.stringify(emailOptions, null, 2))
    const data = await resend.emails.send(emailOptions)
    console.log('Resend API Response:', JSON.stringify(data, null, 2))

    if (data.error) {
      console.error('Resend returned an error:', data.error)
      return { 
        emailSent: false, 
        emailResponse: { ...data, debugOptions: emailOptions } 
      }
    }

    console.log('Email sent successfully via Resend.')
    return { 
      emailSent: true, 
      emailResponse: { ...data, debugOptions: emailOptions } 
    }
  } catch (e) {
    console.error('Failed to send email (exception):', e)
    return { 
      emailSent: false, 
      emailResponse: { error: String(e) } 
    }
  }
}
