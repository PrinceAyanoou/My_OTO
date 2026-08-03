// pages/login.tsx
import { SignIn, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function CustomSignInPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  // Redirection automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Connexion à votre compte
        </h2>

        <SignIn
          routing="hash"
          signUpUrl="/signup" // Lien vers la page d'inscription si l'utilisateur n'a pas de compte
          fallbackRedirectUrl="/dashboard" // Redirection après connexion réussie
        />
      </div>
    </div>
  )
}