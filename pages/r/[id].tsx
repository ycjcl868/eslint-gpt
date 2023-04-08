import { GetStaticPaths } from 'next'
import { getAllRules, getRule } from '@/utils/api'
import IndexPage from '../index'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllRules({
    select: {
      id: true
    }
  })
  return {
    paths: posts.map((row) => `/r/${row.id}`),
    fallback: true
  }
}

export async function getStaticProps({
  locale,
  params: { id }
}: {
  locale: string
  params: any
}) {
  const detail = await getRule({
    where: {
      id
    }
  })

  if (!detail) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      id,
      detail: JSON.parse(JSON.stringify(detail)),
      messages: {
        ...(await import(`../../messages/${locale}.json`))
      }
    }
  }
}

export default IndexPage
