import { Link as LinkIcon, Check, Eye } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { useEffect, useState, useRef } from 'react'
import { nFormatter } from '@/utils/index'

export default function Banner({ views }: { views: number }) {
  const router = useRouter()
  const copyRef = useRef<HTMLButtonElement | null>(null)
  const { id } = router.query as { id: string }
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    copyRef?.current?.focus()
  }, [])

  return (
    <div className='z-10 fixed bottom-5 inset-x-0 mx-auto max-w-fit rounded-lg px-3 py-2 bg-white border border-gray-100 shadow-md flex justify-between space-x-2 items-center'>
      <div className='w-40 flex flex-col items-center justify-center'>
        <a
          href='/'
          rel='noopener noreferrer'
          className='flex space-x-2 items-center justify-center font-medium text-gray-600 px-4 py-1.5 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-all'
        >
          <Image
            alt='EslintGPT logo'
            src='/icon.svg'
            width={20}
            height={20}
            className='rounded-sm'
          />
          <p>EslintGPT</p>
        </a>
      </div>
      <div className='border-l border-gray-200 h-12 w-1' />
      <button
        ref={copyRef}
        onClick={() =>
          navigator.clipboard
            .writeText(`https://eslint.rustc.cloud/r/${id}`)
            .then(() => {
              toast.success('Link copied to clipboard')
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            })
        }
        className='p-2 flex flex-col space-y-1 items-center rounded-md w-12 hover:bg-gray-100 active:bg-gray-200 transition-all'
      >
        {copied ? (
          <Check className='h-4 w-4 text-green-600' />
        ) : (
          <LinkIcon className='h-4 w-4 text-gray-600' />
        )}
        <p className='text-center text-gray-600 text-sm'>Copy</p>
      </button>
      <div className='cursor-default p-2 flex flex-col space-y-1 items-center rounded-md w-12 hover:bg-gray-100 active:bg-gray-200 transition-all'>
        <Eye className='h-4 w-4 text-gray-600' />
        <p className='text-center text-gray-600 text-sm'>{nFormatter(views)}</p>
      </div>
    </div>
  )
}
