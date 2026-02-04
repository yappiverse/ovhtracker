import type { AvailablePlan } from './types'

// Re-export AvailablePlan for backward compatibility
export type { AvailablePlan } from './types'

// Group plans by datacenter for better organization
function groupPlansByDatacenter(plans: AvailablePlan[]): Map<string, AvailablePlan[]> {
  const grouped = new Map<string, AvailablePlan[]>()
  
  for (const plan of plans) {
    const dc = plan.datacenter.datacenter
    if (!grouped.has(dc)) {
      grouped.set(dc, [])
    }
    grouped.get(dc)!.push(plan)
  }
  
  return grouped
}

// Datacenter display names
const datacenterNames: Record<string, string> = {
  'SGP': '🇸🇬 Singapore',
  'BHS': '🇨🇦 Beauharnois (Canada)',
  'GRA': '🇫🇷 Gravelines (France)',
  'SBG': '🇫🇷 Strasbourg (France)',
  'DE': '🇩🇪 Frankfurt (Germany)',
  'WAW': '🇵🇱 Warsaw (Poland)',
  'UK': '🇬🇧 London (UK)',
  'EU-SOUTH-MIL': '🇮🇹 Milan (Italy)',
  'SYD': '🇦🇺 Sydney (Australia)',
}

function getDatacenterName(code: string): string {
  return datacenterNames[code] || code
}

// Format plan code to readable name
function formatPlanName(planCode: string): string {
  const match = planCode.match(/vps-2025-model(\d+)/)
  if (match) {
    return `VPS 2025 Model ${match[1]}`
  }
  return planCode
}

export const generateEmailBody = (plans: AvailablePlan[]) => {
  const grouped = groupPlansByDatacenter(plans)
  const timestamp = new Date().toISOString()
  
  const datacenterSections = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dc, dcPlans]) => `
      <tr>
        <td style="padding: 16px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; color: #fff; font-size: 16px; font-weight: 600;">
            ${getDatacenterName(dc)}
          </h3>
        </td>
      </tr>
      <tr>
        <td style="padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 0 0 8px 8px; margin-bottom: 16px;">
            ${dcPlans.map((plan, i) => {
              const statusBadges = (plan.datacenter.matchedStatusTypes || ['status'])
                .map(type => {
                  const labels: Record<string, string> = {
                    'status': 'General',
                    'linuxStatus': 'Linux',
                    'windowsStatus': 'Windows'
                  }
                  const colors: Record<string, string> = {
                    'status': '#6366f1',
                    'linuxStatus': '#f97316',
                    'windowsStatus': '#0ea5e9'
                  }
                  return `<span style="display: inline-block; padding: 2px 8px; background: ${colors[type] || '#10b981'}; color: #fff; border-radius: 4px; font-size: 10px; font-weight: 600; margin-left: 4px;">${labels[type] || type}</span>`
                }).join('')
              
              return `
              <tr>
                <td style="padding: 12px 24px; border-bottom: ${i < dcPlans.length - 1 ? '1px solid #e2e8f0' : 'none'};">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size: 14px; color: #1a202c; font-weight: 500;">
                        ${formatPlanName(plan.planCode)}
                      </td>
                      <td align="right">
                        <span style="display: inline-block; padding: 4px 12px; background: #10b981; color: #fff; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                          available
                        </span>
                        ${statusBadges}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            `}).join('')}
          </table>
        </td>
      </tr>
    `).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0 0 8px 0; color: #fff; font-size: 28px; font-weight: 700;">
                🚀 VPS Alert!
              </h1>
              <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                OVH VPS plans are now available
              </p>
            </td>
          </tr>
          
          <!-- Summary -->
          <tr>
            <td style="background: #fff; padding: 24px 32px; border-bottom: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 36px; font-weight: 700; color: #10b981;">
                      ${plans.length}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #64748b;">
                      Plans Available in ${grouped.size} Region${grouped.size > 1 ? 's' : ''}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Plans by Datacenter -->
          <tr>
            <td style="background: #fff; padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${datacenterSections}
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="background: #fff; padding: 24px 32px; text-align: center;">
              <a href="https://www.ovhcloud.com/en/vps/" 
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                Order Now on OVH →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 32px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                This alert was generated at ${timestamp}
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                OVH VPS Tracker • Automated Availability Alerts
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
