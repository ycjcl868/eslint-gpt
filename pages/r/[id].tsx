import { getRule } from '@/utils/api'
import IndexPage from '../index'
import { EslintRule, User } from '@prisma/client'

interface EslintRuleWithCreator
  extends Omit<EslintRule, 'createdAt' | 'updatedAt'> {
  updatedAt: string
  createdAt: string
  creator: User // 修改 creator 的类型
}

export async function getServerSideProps({
  locale,
  params: { id }
}: {
  locale: string
  params: any
}) {
  const detail = (await getRule({
    where: {
      id
    },
    include: {
      creator: true
    }
  })) as EslintRuleWithCreator

  if (!detail) {
    return {
      notFound: true
    }
  }

  const serializedDetail = {
    ...detail,
    creator: {
      ...detail.creator,
      createdAt: detail.creator.createdAt.toISOString(),
      updatedAt: detail.creator.updatedAt.toISOString()
    }
  }

  return {
    props: {
      id,
      detail: serializedDetail,
      messages: {
        ...(await import(`../../messages/${locale}.json`))
      }
    }
  }
}

export default IndexPage
