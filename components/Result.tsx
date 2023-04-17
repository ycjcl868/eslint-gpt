import { AnimatePresence, motion } from 'framer-motion'
import { marked } from 'marked'
import prism from 'prismjs'
import ResizablePanel from './ResizablePanel'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Button, ButtonGroup } from '@geist-ui/core'
import { useTranslations } from 'next-intl'

interface ResultProps {
  value: string
  detail?: any
  loading: boolean
  disable?: boolean
  onChange?: (v: string) => void
}

const Result: React.FC<ResultProps> = ({
  detail,
  value,
  loading,
  disable,
  onChange
}) => {
  const { data: session } = useSession()
  const t = useTranslations('Index')
  const [editable, setEditable] = useState<boolean>(false)
  if (!value) {
    return <></>
  }
  // @ts-ignore
  const isOwner = detail?.creatorId === session?.user?.id

  return (
    <ResizablePanel>
      <AnimatePresence mode='wait'>
        <motion.div className='space-y-10'>
          <div className='space-y-8 flex flex-col items-center justify-center max-w-3xl mx-auto'>
            <div
              className={`w-full rounded-xl shadow-md ${
                disable ? 'bg-gray-100' : 'bg-white'
              } transition border relative`}
            >
              {isOwner && !disable && !loading && (
                <div className='bg-gray-50 p-2'>
                  <ButtonGroup style={{ margin: 0 }}>
                    <Button
                      style={
                        !editable
                          ? {
                              border: '1px solid #000'
                            }
                          : {}
                      }
                      onClick={() => setEditable(false)}
                    >
                      {t('previewBtnText')}
                    </Button>
                    <Button
                      className={`${editable ? 'border border-gray-300' : ''}`}
                      style={
                        editable
                          ? {
                              border: '1px solid #000'
                            }
                          : {}
                      }
                      onClick={() => setEditable(true)}
                    >
                      {t('editBtnText')}
                    </Button>
                  </ButtonGroup>
                </div>
              )}
              {editable ? (
                <textarea
                  className='sty1 markdown-body p-2 w-full'
                  value={value}
                  onChange={(e) => onChange?.(e?.target.value)}
                  rows={50}
                />
              ) : (
                <p
                  className='sty1 markdown-body p-2'
                  dangerouslySetInnerHTML={{
                    __html: loading
                      ? value.toString()
                      : marked(value.toString(), {
                          gfm: false,
                          breaks: false,
                          smartypants: false,
                          highlight: (code, lang) => {
                            const realLang = lang || 'javascript'
                            if (prism.languages[realLang]) {
                              return prism.highlight(
                                code,
                                prism.languages[realLang],
                                realLang
                              )
                            } else {
                              return code
                            }
                          }
                        })
                  }}
                />
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </ResizablePanel>
  )
}

export default Result
