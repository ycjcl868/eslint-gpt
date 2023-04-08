import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { marked } from 'marked'
import prism from 'prismjs'
import ResizablePanel from './ResizablePanel'
import { useTranslations } from 'next-intl'

interface ResultProps {
  value: string
  loading: boolean
  disable?: boolean
}

const Result: React.FC<ResultProps> = ({ value, loading, disable }) => {
  const t = useTranslations('Index')

  return (
    <ResizablePanel>
      <AnimatePresence mode='wait'>
        <motion.div className='space-y-10'>
          {value && (
            <div className='space-y-8 flex flex-col items-center justify-center max-w-3xl mx-auto'>
              <div
                className={`w-full rounded-xl shadow-md p-4 ${
                  disable ? 'bg-gray-100' : 'bg-white hover:bg-gray-100'
                } transition cursor-copy border`}
                onClick={() => {
                  navigator.clipboard.writeText(value.trim())
                  toast(t('copyToast'), {
                    icon: '✂️'
                  })
                }}
              >
                <p
                  className='sty1 markdown-body'
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
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </ResizablePanel>
  )
}

export default Result
