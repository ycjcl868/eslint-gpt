import prisma from '@/utils/prisma'

interface Condition {
  where?: any
  select?: any
  orderBy?: any
  take?: any
}

export const getAllRules = async ({
  where,
  select,
  orderBy,
  take
}: Condition = {}) => {
  const rules = await prisma.eslintRule.findMany({
    ...(where && { where }),
    ...(select && { select }),
    ...(orderBy && { orderBy }),
    take
  })
  return rules?.map((rule) => ({
    ...rule,
    updatedAt: rule?.updatedAt.toISOString(),
    createdAt: rule.createdAt.toISOString()
  }))
}

export const getRule = async ({ where, select }: Condition = {}) => {
  const rule = await prisma.eslintRule.findUnique({
    ...(where && { where }),
    ...(select && { select })
  })
  return {
    ...rule,
    updatedAt: rule?.updatedAt.toISOString(),
    createdAt: rule?.createdAt.toISOString()
  }
}
