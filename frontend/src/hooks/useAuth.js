import { useContext, createContext, useState, useEffect } from "react"
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth'
import { auth } from "../firebaseConfig";


const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {
	const provider = new GoogleAuthProvider()
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	const signInWithGoogle = async () => {
		try {
			const result = await signInWithPopup(auth, provider)
			const user = result.user
			setUser(user)
		} catch (error) {
			console.log(error)
		}
	}

	const signOutWithGoogle = () => {
		signOut(auth)
	}

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser)
			setLoading(false)
		})
		return () => unsubscribe()
	}, [user])

	if (loading) {
		return <p>Loading...</p>
	}

	return (
		<AuthContext.Provider 
			value = {{
				user,
				signInWithGoogle,
				signOutWithGoogle
			}}>
			{children}
		</AuthContext.Provider>
	)

}

export const useAuth = () => {
	return useContext(AuthContext)
}

