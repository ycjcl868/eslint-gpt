import { motion } from 'framer-motion'
import Link from 'next/link'
import { nFormatter, timeAgo } from '@/utils/index'
import { Eye } from 'lucide-react'

export default function RuleCard({ data }: { data: any }) {
  let { id, description, creator, views, createdAt } = data
  const avatar = 'https://avatar.vercel.sh/${id};'
  console.log('data', data)

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { type: 'spring' } }
      }}
      className='flex items-center justify-between space-x-5 rounded-md border border-gray-100 bg-white p-4 shadow-md'
    >
      <div className='grid gap-2 flex-1'>
        <Link
          href={`/r/${id}`}
          className='font-medium text-sm sm:text-base line-clamp-2 sm:line-clamp-1 text-gray-700 hover:text-black'
        >
          <h3>{description}</h3>
        </Link>
        <div className='flex items-center space-x-2'>
          <img
            width='20'
            height='20'
            alt='Avatar'
            src={creator?.image || avatar || `https://avatar.vercel.sh/${id}`}
            className='rounded-full'
          />
          <Link href={`/r/${id}`}>
            <p className='sm:hidden text-gray-500 text-sm hover:text-gray-800'>
              {timeAgo(createdAt, true)}
            </p>
            <p className='hidden sm:block text-gray-500 text-sm hover:text-gray-800'>
              created {timeAgo(createdAt)}
            </p>
          </Link>
          <p className='text-gray-500 text-sm'>|</p>
          <Link href={`/r/${id}`}>
            <div className='sm:hidden flex space-x-1 items-center'>
              <Eye className='h-4 w-4 text-gray-600' />
              <p className='text-gray-500 text-sm'>{nFormatter(views)}</p>
            </div>
            <p className='hidden sm:block text-gray-500 text-sm hover:text-gray-800'>
              {nFormatter(views)} views
            </p>
          </Link>
        </div>
      </div>
    </motion.li>
  )
}
