import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function GetTokenTest() {
  const { getToken } = useAuth()

  useEffect(() => {
    async function logToken() {
      const token = await getToken()
      console.log('--- TON TOKEN CLERK ---')
      console.log(token)
    }
    logToken()
  }, [getToken])

  return <p>Regarde la console F12 !</p>
}