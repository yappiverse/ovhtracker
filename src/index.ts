import { Hono } from 'hono'
import availability from './routes/availability'
import { validateEnv } from './env'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Validate environment variables on every request
app.use('*', async (c, next) => {
  validateEnv(c.env)
  await next()
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/', availability)

export default app
