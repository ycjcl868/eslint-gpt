import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, Ruler } from 'lucide-react'
import Popover from './Popover'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

const FADE_IN_ANIMATION_SETTINGS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

export default function UserDropdown() {
  const { data: session } = useSession()
  const t = useTranslations('Index')
  const router = useRouter()
  const { email, image, name } = session?.user || {}
  const [openPopover, setOpenPopover] = useState(false)

  if (!email && !name) return null

  const displayName = email || name || ''

  return (
    <motion.div
      className='relative inline-block text-left'
      {...FADE_IN_ANIMATION_SETTINGS}
    >
      <Popover
        content={
          <div className='w-full rounded-md bg-white p-2 sm:w-56'>
            <button
              className='flex items-center justify-start space-x-2 relative w-full rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100'
              onClick={() => router.push('/my/rules')}
            >
              <Ruler className='h-4 w-4' />
              <p className='text-sm'>{t('myRules')}</p>
            </button>
            <button
              className='flex items-center justify-start space-x-2 relative w-full rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100'
              onClick={() => signOut()}
            >
              <LogOut className='h-4 w-4' />
              <p className='text-sm'>{t('logout')}</p>
            </button>
          </div>
        }
        align='end'
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className='flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-300 transition-all duration-75 focus:outline-none active:scale-95 sm:h-10 sm:w-10'
        >
          <Image
            alt={displayName}
            src={image || `https://avatars.dicebear.com/api/micah/${email}.svg`}
            width={40}
            height={40}
          />
        </button>
      </Popover>
    </motion.div>
  )
}
