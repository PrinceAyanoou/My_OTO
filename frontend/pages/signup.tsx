import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { SignUp, useUser, useAuth, useClerk } from '@clerk/nextjs'

//format du formulaire qu'attend prisma (l'email proviendra directement de clerk)
interface UserFormData {
  nom: string
  prenoms: string
  telephone: string
}

//fonction factice utilisée comme premier paramètre de useSyncExternalStore. i
//on l'utilise ici spécialement pour éviter les erreurs SSR. Il sera false tout le temps vu qu'on est abonné à aucun service externe 
const emptySubscribe = () => () => {}

//fonction pour modifier le formulaire simple envoyé par clerk afin d'avoir le formulaie en plusieurs étape que je veux.
export default function CustomSignUpPage() {

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  //UseState; step représente les étapes que l'on peut avoir dans la complétion du formulaire 
  //1:saisie des informations qui sont destinées à être stockée en db
  //2:Authentification via Clerk
  //3:étape du succès (quand le backend et clerk ont tous les deux bien créé l'utilisateur de leur côté.)
  //4:Échec (erreur de synchronisation ou réseau).
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  //UseState; formaData permet de conserver et de mettre à jour les informations saisies à l'étape 1.
  const [formData, setFormData] = useState<UserFormData>({
    nom: '',
    prenoms: '',
    telephone: '',
  })

  //UseState pour gérer l'attente utilisateur pendant que la requête s'exécute
  const [loading, setLoading] = useState(false)

  //UseState pour les messages d'erreur.
  const [errorMessage, setErrorMessage] = useState('')

  const syncAttempted = useRef(false)

  //isSignedIn permet de savoir s'il est connecté
  //user : les données clerk (contient notamment l'email vérifié par Clerk)
  //getToken :jeton d'authentification Bearer
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const { signOut } = useClerk()

  // Restauration des données du sessionStorage au montage
  useEffect(() => {
    const savedStep = sessionStorage.getItem('signup_step')
    const savedData = sessionStorage.getItem('signup_data')

    if (savedStep || savedData) {
      queueMicrotask(() => {
        if (savedStep) {
          setStep(Number(savedStep) as 1 | 2 | 3 | 4)
        }
        if (savedData) {
          try {
            setFormData(JSON.parse(savedData))
          } catch (e) {
            console.error('Erreur de lecture du sessionStorage:', e)
          }
        }
      })
    }
  }, [])

  // Fonction d'envoi vers l'API
  const handleBackendSync = useCallback(
    async (clerkId: string) => {
      setLoading(true)
      try {
        const token = await getToken()

        // Récupération de l'email principal directement du compte Clerk
        const clerkEmail = user?.primaryEmailAddress?.emailAddress

        if (!clerkEmail) {
          throw new Error("Impossible de récupérer l'adresse email de votre compte Clerk.")
        }

        // Récupération des données personnelles du state ou secours sessionStorage (pour OAuth Google)
        let currentFormData = formData
        if (!currentFormData.nom && typeof window !== 'undefined') {
          const savedData = sessionStorage.getItem('signup_data')
          if (savedData) {
            currentFormData = JSON.parse(savedData)
          }
        }

        const response = await fetch(
          'http://localhost:3000/users',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            //convertir les données en chaîne de caractère Json car les réseaux informatique ne peuvent pas recevoir du js pur.
            body: JSON.stringify({
              clerkUserId: clerkId,
              nom: currentFormData.nom,
              prenoms: currentFormData.prenoms,
              email: clerkEmail, // <--- Email extrait directement de Clerk
              telephone: currentFormData.telephone,
            }),
          }
        )

        const data = await response.json()

        if (response.ok && (data === true || data.success === true)) {
          sessionStorage.removeItem('signup_step')
          sessionStorage.removeItem('signup_data')
          setStep(3)
        } else {
          setErrorMessage(data.message || 'La vérification backend a échoué.')
          setStep(4)
        }
      } catch (error) {
        console.error('Erreur de synchronisation backend :', error)
        setErrorMessage('Impossible de contacter le serveur.')
        setStep(4)
      } finally {
        setLoading(false)
      }
    },
    [formData, getToken, user]
  )

  // Détection automatique de la connexion 
  useEffect(() => {
    // On s'assure qu'on est à l'étape 2, connecté, et qu'une synchro n'est pas déjà en cours
    if (isLoaded && isSignedIn && user && step === 2 && !loading && !syncAttempted.current) {
      syncAttempted.current = true
      //attendre le composent soit mis à jour avant de lancer handleBackendSync
      queueMicrotask(() => {
        handleBackendSync(user.id)
      })
    }
  }, [isSignedIn, user, step, loading, handleBackendSync, isLoaded]) //liste des variables surveilés par le composant.

  //mise à jour des propriétés.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  //s'assure que tous les champs sont rempli avan de passer à l'étape suivante.
  const handleNextStep = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!formData.nom || !formData.prenoms) {
      alert('Veuillez remplir tous les champs obligatoires.')
      return
    }
    sessionStorage.setItem('signup_step', '2')
    sessionStorage.setItem('signup_data', JSON.stringify(formData))
    setStep(2)
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        
        {/* ÉTAPE 1 */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 ">
                Informations Personnelles
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                name="nom"
                required
                value={formData.nom}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                type="text"
                name="prenoms"
                required
                value={formData.prenoms}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#6c47ff] text-white p-2 rounded-md font-medium hover:bg-opacity-90 transition-colors"
            >
              Suivant
            </button>
          </form>
        )}

        {/* ÉTAPE 2 */}
        {step === 2 && (
          <div className="flex flex-col items-center">
            {loading ? (
              <div className="py-8 text-center">
                <p className="text-lg font-semibold text-gray-800">
                  Vérification et création de votre compte...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Veuillez patienter quelques instants.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-4 text-gray-800">
                  Étape 2 : Authentification
                </h2>
                <SignUp
                  routing="hash"
                  fallbackRedirectUrl="/signup"
                />
              </>
            )}
          </div>
        )}

        {/* ÉTAPE 3 */}
        {step === 3 && (
          <div className="text-center py-6">
            <div className="text-green-500 text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Inscription réussie !
            </h2>
            <p className="text-gray-600 mt-2">
              Votre compte a été créé et vérifié avec succès.
            </p>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Accéder au tableau de bord
            </button>
          </div>
        )}

        {/* ÉTAPE 4 */}
        {step === 4 && (
          <div className="text-center py-6">
            <div className="text-red-500 text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Échec de l&apos;inscription
            </h2>
            <p className="text-red-600 mt-2">{errorMessage}</p>
            <button
              onClick={async () => {
                syncAttempted.current = false
                sessionStorage.removeItem('signup_step')
                sessionStorage.removeItem('signup_data')
                await signOut()
                setStep(1)
              }}
              className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900"
            >
              Réessayer
            </button>
          </div>
        )}

      </div>
    </div>
  )
}