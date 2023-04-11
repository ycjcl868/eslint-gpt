import prisma from '@/utils/prisma'

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
  return rules?.map((rule) => ({
    ...rule,
    // @ts-ignore
    creator: JSON.parse(JSON.stringify(rule?.creator)),
    updatedAt: rule?.updatedAt?.toISOString(),
    createdAt: rule?.createdAt?.toISOString()
  }))
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
