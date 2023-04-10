import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react'
import FocusTrap from 'focus-trap-react'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'

export default function Modal({
  children,
  showModal,
  setShowModal,
  bgColor = 'bg-white',
  closeWithX
}: {
  children: React.ReactNode
  showModal: boolean
  setShowModal: Dispatch<SetStateAction<boolean>>
  bgColor?: string
  closeWithX?: boolean
}) {
  const router = useRouter()
  const { key } = router.query
  const mobileModalRef = useRef(null)
  const desktopModalRef = useRef(null)

  const closeModal = useCallback(
    (closeWithX?: boolean) => {
      if (closeWithX) {
        return
      } else if (key) {
        router.push('/')
      } else {
        setShowModal(false)
      }
    },
    [key, router, setShowModal]
  )

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !closeWithX) {
      setShowModal(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  const controls = useAnimation()
  const transitionProps = { type: 'spring', stiffness: 500, damping: 30 }
  useEffect(() => {
    controls.start({
      y: 0,
      transition: transitionProps
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleDragEnd(_: any, info: any) {
    const offset = info.offset.y
    const velocity = info.velocity.y
    // @ts-ignore
    const height = mobileModalRef.current.getBoundingClientRect().height
    if (offset > height / 2 || velocity > 800) {
      await controls.start({ y: '100%', transition: transitionProps })
      closeModal()
    } else {
      controls.start({ y: 0, transition: transitionProps })
    }
  }

  return (
    <AnimatePresence>
      {showModal && (
        <FocusTrap focusTrapOptions={{ initialFocus: false }}>
          <div className='absolute'>
            <motion.div
              ref={mobileModalRef}
              key='mobile-modal'
              className='group fixed inset-x-0 bottom-0 z-40 w-screen cursor-grab active:cursor-grabbing sm:hidden'
              initial={{ y: '100%' }}
              animate={controls}
              exit={{ y: '100%' }}
              transition={transitionProps}
              drag='y'
              dragDirectionLock
              onDragEnd={handleDragEnd}
              dragElastic={{ top: 0, bottom: 1 }}
              dragConstraints={{ top: 0, bottom: 0 }}
            >
              <div
                className={`h-7 ${bgColor} rounded-t-4xl -mb-1 flex w-full items-center justify-center border-t border-gray-200`}
              >
                <div className='-mr-1 h-1 w-6 rounded-full bg-gray-300 transition-all group-active:rotate-12' />
                <div className='h-1 w-6 rounded-full bg-gray-300 transition-all group-active:-rotate-12' />
              </div>
              {children}
            </motion.div>
            <motion.div
              ref={desktopModalRef}
              key='desktop-modal'
              className='fixed inset-0 z-40 hidden min-h-screen items-center justify-center sm:flex'
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onMouseDown={(e) => {
                if (desktopModalRef.current === e.target) {
                  closeModal(closeWithX)
                }
              }}
            >
              {children}
            </motion.div>
            <motion.div
              key='backdrop'
              className='fixed inset-0 z-30 bg-gray-100 bg-opacity-10 backdrop-blur'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => closeModal(closeWithX)}
            />
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  )
}
