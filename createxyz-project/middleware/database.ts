import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';

export function withDatabase(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        switch (error.code) {
          case 'P2002':
            return res.status(409).json({ error: 'Resource already exists' });
          case 'P2025':
            return res.status(404).json({ error: 'Resource not found' });
          default:
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
        }
      }
      
      console.error('Unexpected error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
} 