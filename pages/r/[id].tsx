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
      detail,
      messages: {
        ...(await import(`../../messages/${locale}.json`))
      }
    }
  }
}

export default IndexPage
