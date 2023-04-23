import { useEffect, useMemo, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useLocalStorageState, useSetState } from 'ahooks'
import { LogOut, Ruler, Settings } from 'lucide-react'
import Popover from './Popover'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { Dot, Modal, Text, useModal } from '@geist-ui/core'
import { toast } from 'react-hot-toast'

const FADE_IN_ANIMATION_SETTINGS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

export default function UserDropdown() {
  const { data: session } = useSession()
  const { setVisible, bindings } = useModal()
  // @ts-ignore
  const [settings, setSettings] = useLocalStorageState(session?.user?.id)
  const [config, setConfig] = useSetState<{
    apiKey?: string
    apiModel?: string
  }>({})

  const t = useTranslations('Index')
  const router = useRouter()
  const { email, image, name } = session?.user || {}
  const [openPopover, setOpenPopover] = useState(false)

  useEffect(() => {
    setConfig(settings || {})
  }, [settings])

  if (!email && !name) return null

  const displayName = email || name || ''

  console.log('config', config)

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
              onClick={() => setVisible(true)}
            >
              <Settings className='h-4 w-4' />
              <p className='text-sm'>{t('settings')}</p>
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

      <Modal {...bindings}>
        <Modal.Title>{t('settings')}</Modal.Title>
        {/* <Modal.Subtitle>
          OpenAI official API, more stable, charge by usage
        </Modal.Subtitle> */}
        <Modal.Content>
          <label className='block mb-6'>
            <span className='text-gray-700'>OpenAI Model</span>
            <select
              className='block w-full border-gray-300 shadow-sm focus:border-black focus:ring-black my-2'
              onChange={(e) =>
                setConfig({
                  apiModel: e.target.value
                })
              }
            >
              <option
                value='gpt-3.5-turbo'
                selected={config?.apiModel === 'gpt-3.5-turbo'}
              >
                gpt-3.5-turbo
              </option>
              <option value='gpt-4' selected={config?.apiModel === 'gpt-4'}>
                gpt-4
              </option>
            </select>
          </label>
          <label className='block'>
            <span className='text-gray-700'>OpenAI ApiKey</span>
            <input
              type='text'
              className='w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-2'
              value={config?.apiKey}
              onChange={(e) =>
                setConfig({
                  apiKey: e.target.value
                })
              }
              placeholder='sk-******'
            />
          </label>
          <div className='my-2'>
            <Dot type='warning'>
              <Text small>{t('settingsOpenAIKeyTip')}</Text>
            </Dot>
          </div>
        </Modal.Content>
        <Modal.Action passive onClick={() => setVisible(false)}>
          <span className='text-base'>{t('cancelBtnText')}</span>
        </Modal.Action>
        <Modal.Action
          onClick={() => {
            setSettings(config)
            toast.success(t('submitSuccessText'))
            setVisible(false)
          }}
        >
          <span className='text-base'>{t('submitBtnText')}</span>
        </Modal.Action>
      </Modal>
    </motion.div>
  )
}
