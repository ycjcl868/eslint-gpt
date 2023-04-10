import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import UserDropdown from './UserDropdown'

const FADE_IN_ANIMATION_SETTINGS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

const LinkTab = ({ children }) => {
  return (
    <div className='relative font-medium text-black-600 before:absolute before:-bottom-1 before:h-0.5 before:w-full before:scale-x-0 before:bg-indigo-600 before:transition hover:before:scale-x-100 leading-8'>
      {children}
    </div>
  )
}

export default function Header(props) {
  const { onSignInClick } = props
  const { data: session, status } = useSession()
  const t = useTranslations('Index')
  const { locale, locales, route } = useRouter()
  const otherLocale = locales?.find((cur) => cur !== locale)

  return (
    <header className='flex justify-between items-center w-full mt-5 border-b-2 pb-7 sm:px-4 px-2'>
      <Link href='/' className='flex space-x-3'>
        <Image
          alt='header text'
          src='/icon.svg'
          className='sm:w-12 sm:h-12 w-8 h-8'
          width={32}
          height={32}
        />
        <h1 className='sm:text-4xl text-2xl font-bold ml-2 tracking-tight'>
          {t('title')}
        </h1>
      </Link>

      <div className='flex gap-6'>
        <LinkTab>
          <Link href='/explore' locale={otherLocale}>
            Explore
          </Link>
        </LinkTab>
        {otherLocale && (
          <LinkTab>
            <Link href={route} locale={otherLocale}>
              {t('switchLocale', { locale: otherLocale })}
            </Link>
          </LinkTab>
        )}
        <div>
          <AnimatePresence>
            {!session && status !== 'loading' ? (
              <motion.button
                className='bg-black text-white text-sm px-4 p-1.5 rounded-md border border-black hover:bg-white hover:text-black transition-all'
                onClick={onSignInClick}
                {...FADE_IN_ANIMATION_SETTINGS}
              >
                Sign In
              </motion.button>
            ) : (
              <UserDropdown />
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
