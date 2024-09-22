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

  // @ts-ignore
  if (detail?.creator) {
    // @ts-ignore
    detail.creator?.createdAt &&
      // @ts-ignore
      (detail.creator.createdAt = detail.creator.createdAt.toISOString())
    // @ts-ignore
    detail.creator?.updatedAt &&
      // @ts-ignore
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
