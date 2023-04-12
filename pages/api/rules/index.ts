import { NextApiRequest, NextApiResponse } from 'next'
import { ratelimit } from '@/utils/upstash'
import prisma from '@/utils/prisma'
import { nanoid } from '@/utils/index'
import { getServerSession } from '@/utils/session'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'OPTIONS') {
    res.status(200).send('OK')
  } else if (req.method === 'POST') {
    try {
      const { success } = await ratelimit.limit('eslintgpt-save-endpoint')
      if (!success) {
        return res.status(429).json({ error: "Don't DDoS me pls 🥺" })
      }

      const session = await getServerSession(req, res)
      console.log('session data: ', session)
      if (!session) {
        res.status(401).json({ message: 'You must be logged in.' })
        return
      }

      const body = {
        ...req.body,
        userId: session.user.id
      }
      const response = await saveEslintRule(body)
      return res.status(200).json(response)
    } catch (error: unknown) {
      console.log('Error saving lint rule: ', error)
      return res.status(500).json({ message: 'Error saving the lint rule.' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

async function saveEslintRule(params: {
  userId: string | null
  description: string
  correct?: string
  incorrect?: string
  locale: 'zh' | 'en'
  result: string
}): Promise<any> {
  const { userId, description, correct, incorrect, locale, result } = params
  const id = nanoid()
  try {
    await prisma.eslintRule.create({
      data: {
        id,
        description,
        locale,
        result,
        ...(correct && { correct }),
        ...(incorrect && { incorrect }),
        ...(userId && { creatorId: userId })
      }
    })
    return { id }
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('Key already exists, trying again...')
      return saveEslintRule(params)
    }
    throw e
  }
}
