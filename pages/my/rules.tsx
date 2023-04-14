import { GetServerSidePropsContext } from 'next'
import { getServerSession } from '@/utils/session'
import React from 'react'
import Header from '@/components/Header'
import { getAllRules } from '@/utils/api'
import RuleCard from '@/components/RuleCard'
import { useTranslations } from 'next-intl'

export interface ExploreProps {
  rules: any[]
}

const MyRules: React.FunctionComponent<ExploreProps> = (props) => {
  const { rules } = props
  const t = useTranslations('Index')

  return (
    <div className='mx-auto py-2 min-h-screen'>
      <div className='max-w-5xl mx-auto '>
        <Header />
      </div>
      <main
        className={`flex flex-1 w-full flex-col items-center justify-center px-4 mt-6`}
      >
        <h2 className='text-3xl sm:text-4xl font-semibold font-display'>
          {t('myRules')}
        </h2>
        <div className='max-w-xl w-full'>
          <ul className='mt-8 grid gap-2'>
            {rules.map((rule) => {
              return (
                <RuleCard
                  key={rule.id}
                  data={rule}
                  showPrivate
                  initalChecked={!rule.private}
                />
              )
            })}
          </ul>
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // @ts-ignore
  const session = await getServerSession(context.req, context.res)
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const rules = await getAllRules({
    where: {
      creatorId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      creator: true
    }
  })

  console.log('rulesrulesrules', rules)

  return {
    props: {
      rules,
      messages: {
        ...(await import(`../../messages/${context.locale}.json`))
      }
    }
  }
}

export default MyRules
