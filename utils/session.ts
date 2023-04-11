import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession as _getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'

export interface Session {
  user: {
    email?: string | null
    id?: string | null
    name?: string | null
  }
}

export async function getServerSession(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return (await _getServerSession(req, res, authOptions)) as Session
}
