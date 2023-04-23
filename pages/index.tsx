import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Toaster, toast } from 'react-hot-toast'
import { TwitterShareButton } from 'react-share'
import Balancer from 'react-wrap-balancer'
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline'
import Footer from '../components/Footer'
import Github from '../components/GitHub'
import TwitterIcon from '../components/TwitterIcon'
import Header from '../components/Header'
import LoadingDots from '../components/LoadingDots'
import Banner from '../components/Banner'
import { fetchWithTimeout } from '../utils/fetchWithTimeout'
import { generateSignature } from '../utils/auth'
import useView from '@/hooks/useView'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useSignInModal } from '@/hooks/useSignInModal'
import { useSession } from 'next-auth/react'
import { useLocalStorageState } from 'ahooks'

const Result = dynamic(() => import('../components/Result'), { ssr: false })

const useUserKey = process.env.NEXT_PUBLIC_USE_USER_KEY === 'true'
const useNotice = process.env.NEXT_NOTICE === 'true'

const REQUEST_TIMEOUT = 15 * 1000
const GOOD_PLACEHOLDER =
  "const id = '1234';\nconst rawText = '账户';\nconst rawText1 = `账户: ${id}`;\nconst rawText2 = '账号';\nconst rawText3 = `账号: ${id}`;"
const BAD_PLACEHOLDER =
  "const id = '1234';\nconst rawText = '帐户';\nconst rawText1 = `帐户: ${id}`;\nconst rawText2 = '帐号';\nconst rawText3 = `帐号: ${id}`;"

const Home: NextPage<{ detail: any }> = (props) => {
  const t = useTranslations('Index')
  const locale = useLocale()
  const router = useRouter()
  const { data: session } = useSession()
  const { id } = router.query

  const detail = id && props.detail ? props.detail : null

  const [loading, setLoading] = useState(false)
  const [settings] = useLocalStorageState<{ apiKey?: string }>(
    // @ts-ignore
    session?.user?.id
  )
  const [chat, setChat] = useState(detail?.description || t('placeholder'))
  const [good, setGood] = useState(detail?.correct || GOOD_PLACEHOLDER)
  const [bad, setBad] = useState(detail?.incorrect || BAD_PLACEHOLDER)
  const [api_key, setAPIKey] = useState('')

  const [generatedChat, setGeneratedChat] = useState<String>(
    detail?.result || ''
  )

  const { SignInModal, setShowSignInModal } = useSignInModal()

  console.log('Streamed response: ', generatedChat)
  console.log('locale', locale)

  useView(detail?.id)
  useEffect(() => {
    setChat(detail?.description || t('placeholder'))
  }, [t('placeholder')])

  useEffect(() => {
    if (!id) {
      setChat(t('placeholder'))
      setGood(GOOD_PLACEHOLDER)
      setBad(BAD_PLACEHOLDER)
      setGeneratedChat('')
    }
  }, [id])

  const generateChat = async (e: any) => {
    e.preventDefault()
    if (!session?.user) {
      return setShowSignInModal(true)
    }

    if (!chat) {
      return
    }
    setGeneratedChat('')
    setLoading(true)

    let response
    const timestamp = Date.now()
    try {
      response = useUserKey
        ? await fetchWithTimeout('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: REQUEST_TIMEOUT,
            body: JSON.stringify({
              description: chat,
              good,
              bad,
              api_key,
              locale,
              time: timestamp,
              userApiKey: settings?.apiKey,
              sign: await generateSignature({
                t: timestamp,
                m: chat || ''
              })
            })
          })
        : await fetchWithTimeout('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: REQUEST_TIMEOUT,
            body: JSON.stringify({
              description: chat,
              good,
              bad,
              locale,
              userApiKey: settings?.apiKey,
              time: timestamp,
              sign: await generateSignature({
                t: timestamp,
                m: chat || ''
              })
            })
          })
    } catch (e: unknown) {
      console.error('[fetch ERROR]', e)
      if (e instanceof Error && e?.name === 'AbortError') {
        // timeout
        setLoading(false)
        toast.error(t('timeout'))
      }
      return
    }

    console.log('Edge function returned.')

    if (!response.ok) {
      console.log('response', response.body)
      toast.error('ERROR: ' + response.statusText)
      setLoading(false)
      throw new Error(response.statusText)
    }

    // This data is a ReadableStream
    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value).replace('<|im_end|>', '')
      setGeneratedChat((prev) => prev + chunkValue)
    }

    setLoading(false)
  }

  const disabled = !chat
  // @ts-ignore
  const isOwner = detail?.id && detail?.creatorId === session?.user?.id

  const handleSave = async () => {
    const response = await fetchWithTimeout('/api/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: REQUEST_TIMEOUT,
      body: JSON.stringify({
        description: chat,
        correct: good,
        incorrect: bad,
        result: generatedChat,
        locale
      })
    })

    const data = await response.json()
    if (response.status !== 200) {
      const errMsg = data?.message || `ERROR: ${response.statusText}`
      toast.error(errMsg)
      throw new Error(errMsg)
    }

    if (!data?.id) {
      toast.error(t('saveFailToast'))
      return
    }
    toast.success(t('saveSuccessToast'))

    return data
  }

  const handleEdit = async () => {
    const response = await fetchWithTimeout(`/api/rules/${detail.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: REQUEST_TIMEOUT,
      body: JSON.stringify({
        description: chat,
        correct: good,
        incorrect: bad,
        result: generatedChat,
        locale
      })
    })

    const data = await response.json()
    if (response.status !== 200) {
      const errMsg = data?.message || `ERROR: ${response.statusText}`
      toast.error(errMsg)
      throw new Error(errMsg)
    }

    if (!data?.id) {
      toast.error(t('editFailToast'))
      return
    }
    toast.success(t('editSuccessToast'))

    return data
  }

  return (
    <div>
      <SignInModal />
      <div className='flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
        <Head>
          <title>{detail?.description || t('title')}</title>
          <meta name='description' content={t('description2')} />
          <meta
            property='og:site_name'
            content={detail?.description || t('title')}
          />
          <meta property='og:description' content={t('description2')} />
          <meta
            property='og:title'
            content={detail?.description || t('title')}
          />
          <meta name='twitter:card' content={t('description2')} />
          <meta
            name='twitter:title'
            content={detail?.description || t('title')}
          />
          <meta name='twitter:description' content={t('description2')} />
        </Head>

        <Header onSignInClick={() => setShowSignInModal(true)} />
        <main
          className={`flex flex-1 w-full flex-col items-center justify-center px-4 mt-6`}
        >
          <div className='flex items-center justify-center mb-5'>
            <Link
              className='flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-md transition-colors hover:bg-gray-100 mr-3'
              href='https://github.com/ycjcl868/eslint-gpt'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Github />
              <p>Star on GitHub</p>
            </Link>
            <TwitterShareButton
              url={`https://eslint.rustc.cloud${router.asPath}`}
              hashtags={['chatgpt', 'eslint', 'github']}
            >
              <TwitterIcon
                className='fill-[#00aced] opacity-100 hover:opacity-80 transition-opacity'
                size={32}
              />
            </TwitterShareButton>
          </div>
          {!detail?.id ? (
            <h1 className='sm:text-6xl text-4xl max-w-2xl font-bold text-slate-900'>
              <div className='px-4 py-2 sm:mt-3 mt-8 w-full' />
              <Balancer>{t('description2')}</Balancer>
            </h1>
          ) : (
            <h2 className='text-3xl sm:text-4xl font-semibold font-display mb-5'>
              {t('browseRule')}
            </h2>
          )}
          {useNotice && <p className='text-slate-500 mt-5'>{t('notice')}</p>}
          <div className='max-w-xl w-full'>
            {useUserKey && (
              <>
                <input
                  value={api_key}
                  onChange={(e) => setAPIKey(e.target.value)}
                  className='w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-black p-2'
                  placeholder={t('openaiApiKeyPlaceholder')}
                />
              </>
            )}

            <div>
              <div
                className={`flex ${
                  detail?.id ? '' : 'mt-10'
                } items-center space-x-3`}
              >
                <Image
                  src='/1-black.png'
                  width={30}
                  height={30}
                  alt='1 icon'
                  className='mb-5 sm:mb-0'
                />
                <p className='text-left font-medium'>{t('step1')} </p>
              </div>

              <textarea
                value={chat}
                onChange={(e) => setChat(e.target.value)}
                rows={4}
                disabled={detail?.id ? !isOwner : false}
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-2 ${
                  detail?.id ? 'bg-gray-100' : ''
                }`}
              />
            </div>

            <div>
              <div className='flex mt-5 items-center space-x-3'>
                <Image
                  src='/2-black.png'
                  width={30}
                  height={30}
                  alt='2 icon'
                  className='mb-5 sm:mb-0'
                />
                <p className='text-left font-medium'>{t('step2')} </p>
              </div>

              <div className='flex space-x-3'>
                <div className='flex-1 mt-2'>
                  <label className='flex items-center'>
                    <HandThumbDownIcon className='w-4 h-4 text-red-400' />
                    &nbsp;
                    {t('badLabel')}
                  </label>
                  <textarea
                    value={bad}
                    onChange={(e) => setBad(e.target.value)}
                    rows={12}
                    disabled={detail?.id ? !isOwner : false}
                    className='bg-[#fff6f6] w-full rounded-md border-gray-300 shadow-sm focus:border-red-400 focus:ring-red-400 my-2'
                  />
                </div>
                <div className='flex-1 mt-2'>
                  <label className='flex items-center'>
                    <HandThumbUpIcon className='w-4 h-4 text-green-400' />
                    &nbsp;
                    {t('goodLabel')}
                  </label>
                  <textarea
                    value={good}
                    onChange={(e) => setGood(e.target.value)}
                    disabled={detail?.id ? !isOwner : false}
                    rows={12}
                    className='bg-[#f6fff6] w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 my-2'
                  />
                </div>
              </div>
            </div>

            {!detail?.id && !loading && (
              <button
                className={`rounded-xl font-medium px-4 py-2 sm:mt-10 mt-8 w-full ${
                  disabled
                    ? 'cursor: not-allowed bg-[#fafafa] border border-[#eaeaea] text-[#888] filter grayscale'
                    : 'bg-black text-white hover:bg-black/80'
                }`}
                onClick={(e) => generateChat(e)}
                disabled={disabled}
              >
                {t('simplifierButton')} &rarr;
              </button>
            )}
            {loading && (
              <button
                className='bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full'
                disabled
              >
                <LoadingDots color='white' style='large' />
              </button>
            )}
            <br></br>
            <br></br>
            {!detail?.id && !generatedChat && (
              <div className='mt-1 items-center space-x-3'>
                <span className='text-slate-200'>
                  {t('privacyPolicy1')}
                  <a
                    className='text-blue-200 hover:text-blue-400'
                    href='https://github.com/ycjcl868/eslint-gpt/blob/main/privacy.md'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {' '}
                    {t('privacyPolicy2')}
                  </a>
                </span>
              </div>
            )}
          </div>
          <Toaster
            position='top-center'
            reverseOrder={false}
            toastOptions={{ duration: 2000 }}
          />
          <hr className='h-px bg-gray-700 border-1 dark:bg-gray-700' />
          <Result
            value={`${generatedChat}`}
            loading={loading}
            detail={detail}
            disable={detail?.id ? !isOwner : false}
            onChange={(v) => setGeneratedChat(v)}
          />
        </main>
        {generatedChat && !loading ? (
          <Banner detail={detail} onSave={handleSave} onEdit={handleEdit} />
        ) : (
          <Footer />
        )}
      </div>
    </div>
  )
}

export default Home

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      detail: null,
      messages: {
        ...(await import(`../messages/${locale}.json`))
      }
    }
  }
}
