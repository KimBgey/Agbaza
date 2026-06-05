import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'
import i18n from '../i18n'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await getDoc(doc(db, 'agbaza_users', u.uid))
        if (snap.exists()) {
          const profile = snap.data()
          setUserProfile(profile)
          if (profile.language) {
            i18n.changeLanguage(profile.language)
            localStorage.setItem('ag_lang', profile.language)
          }
        } else {
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const register = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    return cred
  }

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider)

  const logout = () => signOut(auth)

  const saveProfile = async (data) => {
    if (!user) return
    const profile = { ...data, updatedAt: new Date() }
    await setDoc(doc(db, 'agbaza_users', user.uid), profile, { merge: true })
    setUserProfile(prev => ({ ...prev, ...profile }))
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, loginWithGoogle, logout, saveProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
