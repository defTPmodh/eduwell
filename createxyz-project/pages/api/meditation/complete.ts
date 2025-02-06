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

    const { sessionId, completed } = req.body;
    
    const meditation = await prisma.meditationSession.update({
      where: {
        id: sessionId,
      },
      data: {
        completed,
      },
    });

    res.status(200).json(meditation);
  } catch (error) {
    console.error('Error completing meditation:', error);
    res.status(500).json({ error: 'Failed to complete meditation' });
  }
} 