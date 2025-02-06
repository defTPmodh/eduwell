import { getSession } from 'next-auth/react'
import type { NextApiRequest, NextApiResponse } from 'next'

export function withAuth(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    req.user = session.user
    return handler(req, res)
  }
} 