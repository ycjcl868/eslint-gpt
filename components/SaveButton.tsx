import { useState } from 'react'
import LoadingCircle from '@/components/LoadingCircle'
import { useSignInModal } from '@/hooks/useSignInModal'
import { useSession } from 'next-auth/react'
import { Bookmark } from 'lucide-react'
import { useRef } from 'react'

export default function SaveButton({
  onSave,
  setId
}: {
  onSave: any
  setId: any
}) {
  const { data: session } = useSession()
  const { SignInModal, setShowSignInModal } = useSignInModal()

  const buttonRef = useRef<any>()

  const [data, setData] = useState<any>()
  const [submitting, setSubmitting] = useState(false)

  const handleSave = async () => {
    console.log('session?.user', session?.user)
    if (!session?.user) {
      setShowSignInModal(true)
    } else {
      try {
        setSubmitting(true)
        const data = await onSave?.()

        if (data) {
          setData(data)
          data?.id && setId(data?.id)
        }
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <>
      <SignInModal />
      <button
        ref={buttonRef}
        onClick={handleSave}
        disabled={submitting || data?.id}
        className={`${
          submitting ? 'cursor-not-allowed' : ''
        } p-2 flex flex-col space-y-1 items-center rounded-md w-12 hover:bg-gray-100 active:bg-gray-200 transition-all`}
      >
        {submitting ? (
          <LoadingCircle />
        ) : data?.id ? (
          <Bookmark className='h-4 w-4 text-rose-500' fill='#F43F5E' />
        ) : (
          <Bookmark className='h-4 w-4 text-gray-600' />
        )}
        <p>Save</p>
      </button>
    </>
  )
}
