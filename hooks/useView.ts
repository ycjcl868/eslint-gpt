import { useEffect } from 'react'

export default function useView(id: string) {
  useEffect(() => {
    console.log('id', id)
    if (id) {
      fetch(`/api/rules/${id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }, [])
}
