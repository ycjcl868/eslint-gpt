import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { search } = req.query as {
      search?: string
    }

    const response = await prisma.eslintRule.count({
      ...(search && {
        where: {
          description: {
            search: search
          }
        }
      })
    })

    res.status(200).json({
      count: response
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
