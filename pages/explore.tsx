import React from 'react'
import Header from '../components/Header'
import { getAllRules } from '@/utils/api'
import RuleCard from '../components/RuleCard'

export interface ExploreProps {
  rules: any[]
}

const Explore: React.FunctionComponent<ExploreProps> = (props) => {
  const { rules } = props
  return (
    <div className='mx-auto py-2 min-h-screen'>
      <div className='max-w-5xl mx-auto '>
        <Header />
      </div>
      <main
        className={`flex flex-1 w-full flex-col items-center justify-center px-4 mt-6`}
      >
        <h2 className='text-3xl sm:text-4xl font-semibold font-display'>
          Browse Examples
        </h2>
        <div className='max-w-xl w-full'>
          <ul className='mt-8 grid gap-2'>
            {rules.map((rule) => {
              return <RuleCard key={rule.id} data={rule} />
            })}
          </ul>
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  const rules = await getAllRules({
    where: {
      private: false
    },
    orderBy: {
      views: 'desc'
    },
    take: 10,
    include: {
      creator: true
    }
  })

  return {
    props: {
      rules,
      messages: {
        ...(await import(`../messages/${locale}.json`))
      }
    }
  }
}

export default Explore
