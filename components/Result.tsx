import { AnimatePresence, motion } from 'framer-motion'
import { marked } from 'marked'
import prism from 'prismjs'
import ResizablePanel from './ResizablePanel'

interface ResultProps {
  value: string
  loading: boolean
  disable?: boolean
}

const Result: React.FC<ResultProps> = ({ value, loading, disable }) => {
  if (!value) {
    return <></>
  }
  return (
    <ResizablePanel>
      <AnimatePresence mode='wait'>
        <motion.div className='space-y-10'>
          <div className='space-y-8 flex flex-col items-center justify-center max-w-3xl mx-auto'>
            <div
              className={`w-full rounded-xl shadow-md ${
                disable ? 'bg-gray-100' : 'bg-white'
              } transition border`}
            >
              <p
                className='sty1 markdown-body p-2'
                contentEditable={!disable && !loading}
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
        </motion.div>
      </AnimatePresence>
    </ResizablePanel>
  )
}

export default Result
