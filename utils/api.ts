import prisma from '@/utils/prisma'
import { Prisma } from '@prisma/client'

interface Condition {
  where?: any
  select?: any
  orderBy?: any
  take?: any
  include?: any
}

export const getAllRules = async ({
  where,
  select,
  orderBy,
  take,
  include
}: Condition = {}) => {
  const rules = await prisma.eslintRule.findMany({
    ...(where && { where }),
    ...(select && { select }),
    ...(orderBy && { orderBy }),
    ...(include && { include }),
    take
  })
  return rules?.map((rule) => {
    return {
      ...rule,
      // @ts-ignore
      ...(rule.creator && {
        creator: {
          // @ts-ignore
          ...rule.creator,
          // @ts-ignore
          updatedAt: rule.creator?.updatedAt?.toISOString(),
          // @ts-ignore
          createdAt: rule.creator?.createdAt?.toISOString()
        }
      }),
      updatedAt: rule?.updatedAt?.toISOString(),
      createdAt: rule?.createdAt?.toISOString()
    }
  })
}

export const getRule = async ({ where, select }: Condition = {}) => {
  const rule = await prisma.eslintRule.findUnique({
    ...(where && { where }),
    ...(select && { select })
  })
  return {
    ...rule,
    updatedAt: rule?.updatedAt?.toISOString(),
    createdAt: rule?.createdAt?.toISOString()
  }
}
