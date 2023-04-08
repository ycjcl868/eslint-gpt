import prisma from '@/utils/prisma'

interface Condition {
  where?: any
  select?: any
}

export const getAllRules = async ({ where, select }: Condition = {}) => {
  const rules = await prisma.eslintRule.findMany({
    ...(where && { where }),
    ...(select && { select })
  })
  return rules
}

export const getRule = async ({ where, select }: Condition = {}) => {
  const rule = await prisma.eslintRule.findUnique({
    ...(where && { where }),
    ...(select && { select })
  })
  return rule
}
