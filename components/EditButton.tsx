import { useState } from 'react'
import LoadingCircle from '@/components/LoadingCircle'
import { useSignInModal } from '@/hooks/useSignInModal'
import { useSession } from 'next-auth/react'
import { Edit } from 'lucide-react'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'

export default function EditButton({ onEdit }: { onEdit: any }) {
  const t = useTranslations('Index')
  const { data: session } = useSession()
  const { SignInModal, setShowSignInModal } = useSignInModal()

  const buttonRef = useRef<any>()

  const [submitting, setSubmitting] = useState(false)

  const handleEdit = async () => {
    if (!session?.user) {
      setShowSignInModal(true)
    } else {
      try {
        setSubmitting(true)
        await onEdit?.()
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
        onClick={handleEdit}
        className={`${
          submitting ? 'cursor-not-allowed' : ''
        } p-2 flex flex-col space-y-1 items-center rounded-md w-12 hover:bg-gray-100 active:bg-gray-200 transition-all`}
      >
        {submitting ? (
          <LoadingCircle />
        ) : (
          <Edit className='h-4 w-4 text-gray-600' />
        )}
        <p className='text-center text-gray-600 text-sm'>{t('editBtnText')}</p>
      </button>
    </>
  )
}
