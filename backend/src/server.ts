import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import { authRoutes } from './routes/auth'
import { tripRoutes } from './routes/trips'
import { stopRoutes } from './routes/stops'
import { driverRoutes } from './routes/drivers'

const server = Fastify({ logger: true })

// ─── Plugins ─────────────────────────────────────────────────────────────────
await server.register(helmet)
await server.register(cors, {
  origin: [
    process.env.ADMIN_URL ?? 'http://localhost:3000',
    process.env.DRIVER_URL ?? 'http://localhost:3001',
  ],
  credentials: true,
})
await server.register(jwt, {
  secret: process.env.JWT_SECRET!,
})

// ─── Routes ──────────────────────────────────────────────────────────────────
await server.register(authRoutes, { prefix: '/auth' })
await server.register(tripRoutes, { prefix: '/trips' })
await server.register(stopRoutes, { prefix: '/stops' })
await server.register(driverRoutes, { prefix: '/drivers' })

// ─── Start ───────────────────────────────────────────────────────────────────
try {
  await server.listen({ port: 4000, host: '0.0.0.0' })
} catch (err) {
  server.log.error(err)
  process.exit(1)
}
