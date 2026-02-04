import { REQUIRED_ENV_VARS } from './config'
import type { Bindings } from './types'

export function validateEnv(env: Partial<Bindings>): asserts env is Bindings {
  const missingVars: string[] = []

  for (const varName of REQUIRED_ENV_VARS) {
    if (!env[varName]) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    const message = `❌ Missing required environment variables:\n${missingVars.map(v => `  - ${v}`).join('\n')}\n\nPlease add them to your .env file or environment.`
    console.error(message)
    throw new Error(message)
  }
}
