import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: eslintRuleId } = req.query as { id: string }

  if (req.method === 'GET') {
    const response = await prisma.eslintRule.findUnique({
      where: {
        id: eslintRuleId
      }
    })
    res.status(200).json(response)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
