import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      const { type, details, duration } = req.body;

      const log = await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          type,
          details,
          duration,
        },
      });

      return res.status(200).json(log);
    }

    if (req.method === 'GET') {
      const logs = await prisma.activityLog.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(logs);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Activity log error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
} 