import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await prisma.$connect()
    const userCount = await prisma.user.count()
    res.status(200).json({ message: 'Database connected successfully', userCount })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({ error: 'Failed to connect to database' })
  }
} 