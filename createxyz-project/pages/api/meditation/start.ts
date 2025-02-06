import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, duration } = req.body;
    
    const meditation = await prisma.meditationSession.create({
      data: {
        userId: session.user.id,
        type,
        duration,
      },
    });

    res.status(200).json(meditation);
  } catch (error) {
    console.error('Error starting meditation:', error);
    res.status(500).json({ error: 'Failed to start meditation' });
  }
} 