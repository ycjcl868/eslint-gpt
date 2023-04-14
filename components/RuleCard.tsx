import { motion } from 'framer-motion'
import { Toggle } from '@geist-ui/core'
import Image from 'next/image'
import Link from 'next/link'
import { nFormatter, timeAgo } from '@/utils/index'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { useTranslations } from 'next-intl'

export default function RuleCard({ data, showPrivate, initalChecked }: any) {
  const t = useTranslations('Index')
  let { id, description, creator, views, createdAt } = data
  const avatar = 'https://avatar.vercel.sh/${id};'

  const [checked, setChecked] = useState(initalChecked)
  const [loading, setLoading] = useState(false)

  const handleChecked = async (e: any) => {
    const rulePublic = e.target.checked
    setLoading(true)
    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          private: !rulePublic
        })
      })

      if (response.status !== 200) {
        toast.error('ERROR: ' + response.statusText)
        throw new Error('ERROR')
      }
      console.log('success')
      toast.success(t('setPrivateSuccessToast'))
    } catch (e) {
      setChecked(initalChecked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster
        position='top-center'
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
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
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Image
                width='20'
                height='20'
                alt='Avatar'
                src={
                  creator?.image || avatar || `https://avatar.vercel.sh/${id}`
                }
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
            {showPrivate && (
              <div className='flex justify-center space-x-1'>
                <span className='text-sm'>
                  {checked ? 'Public' : 'Private'}
                </span>
                <Toggle
                  type='secondary'
                  initialChecked={checked}
                  checked={checked}
                  disabled={!!loading}
                  onChange={handleChecked}
                />
              </div>
            )}
          </div>
        </div>
      </motion.li>
    </>
  )
}
