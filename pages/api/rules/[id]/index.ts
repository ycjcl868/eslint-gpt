import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/prisma'
import { getServerSession } from '@/utils/session'

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
  } else if (req.method === 'POST') {
    const session = await getServerSession(req, res)
    if (!session) {
      res.status(401).json({ message: 'You must be logged in.' })
      return
    }
    const rule = await prisma.eslintRule.findFirst({
      where: {
        id: eslintRuleId,
        // @ts-ignore
        creatorId: session.user.id || ''
      }
    })

    if (!rule) {
      res.status(404).json({ message: 'Rule not found.' })
      return
    }

    console.log('rule', rule)

    // edit
    const response = await prisma.eslintRule.update({
      where: {
        id: rule.id
      },
      data: req.body
    })
    console.log('response', response)
    res.status(200).json(response)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
