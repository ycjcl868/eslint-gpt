import { getRule } from '@/utils/api'
import IndexPage from '../index'

export async function getServerSideProps({
  locale,
  params: { id }
}: {
  locale: string
  params: any
}) {
  const detail = await getRule({
    where: {
      id
    },
    include: {
      creator: true
    }
  })

  if (detail?.creator) {
    detail.creator?.createdAt &&
      (detail.creator.createdAt = detail.creator.createdAt.toISOString())
    detail.creator?.updatedAt &&
      (detail.creator.updatedAt = detail.creator.updatedAt.toISOString())
  }

  if (!detail) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      id,
      detail,
      messages: {
        ...(await import(`../../messages/${locale}.json`))
      }
    }
  }
}

export default IndexPage
