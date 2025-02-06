import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

// Rate limiter setup
const rateLimiter = new RateLimiterMemory({
  points: 10, // Number of requests
  duration: 1, // Per second
})

// Error handler
const handleError = (error: any) => {
  if (error.code === 'P2002') {
    return { status: 409, message: 'Resource already exists' }
  }
  if (error.code === 'P2025') {
    return { status: 404, message: 'Resource not found' }
  }
  console.error(error)
  return { status: 500, message: 'Internal server error' }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Rate limiting
    try {
      await rateLimiter.consume(req.socket.remoteAddress ?? 'anonymous')
    } catch {
      return res.status(429).json({ error: 'Too many requests' })
    }

    // Authentication check
    const session = await getSession({ req })
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'POST') {
      const data = JSON.parse(req.body)
      
      // Validate user access
      if (data.params.userId && data.params.userId !== session.user.id) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      // Add user ID to create operations
      if (data.action === 'create') {
        data.params.userId = session.user.id
      }

      const result = await prisma[data.model][data.action](data.params)
      return res.status(200).json(result)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    const { status, message } = handleError(error)
    return res.status(status).json({ error: message })
  }
} 