import { useState, useEffect } from 'react'
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, setDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

export function usePrograms() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPrograms = async () => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(
        collection(db, `agbaza_programs/${user.uid}/programs`),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      setPrograms(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { fetchPrograms() }, [user])

  const createProgram = async (data) => {
    if (!user) return
    const ref = await addDoc(
      collection(db, `agbaza_programs/${user.uid}/programs`),
      { ...data, createdAt: serverTimestamp(), lastUsed: null }
    )
    await fetchPrograms()
    return ref.id
  }

  const updateProgram = async (id, data) => {
    if (!user) return
    await updateDoc(doc(db, `agbaza_programs/${user.uid}/programs`, id), data)
    await fetchPrograms()
  }

  const deleteProgram = async (id) => {
    if (!user) return
    await deleteDoc(doc(db, `agbaza_programs/${user.uid}/programs`, id))
    await fetchPrograms()
  }

  return { programs, loading, createProgram, updateProgram, deleteProgram, refetch: fetchPrograms }
}

export function useSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSessions = async () => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(
        collection(db, `agbaza_sessions/${user.uid}/sessions`),
        orderBy('startedAt', 'desc')
      )
      const snap = await getDocs(q)
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { fetchSessions() }, [user])

  const saveSession = async (data) => {
    if (!user) return
    const ref = await addDoc(
      collection(db, `agbaza_sessions/${user.uid}/sessions`),
      { ...data, startedAt: serverTimestamp() }
    )
    await fetchSessions()
    return ref.id
  }

  return { sessions, loading, saveSession, refetch: fetchSessions }
}

export function useExercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const snap = await getDocs(collection(db, 'agbaza_exercises'))
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Sort: global first, then custom for this user
        setExercises(all.filter(e => !e.isCustom || e.createdBy === user?.uid))
      } catch (_) {}
      setLoading(false)
    }
    fetch()
  }, [user])

  const addCustomExercise = async (data) => {
    if (!user) return
    const ref = await addDoc(collection(db, 'agbaza_exercises'), {
      ...data,
      isCustom: true,
      createdBy: user.uid
    })
    const newEx = { id: ref.id, ...data, isCustom: true, createdBy: user.uid }
    setExercises(prev => [...prev, newEx])
    return ref.id
  }

  return { exercises, loading, addCustomExercise }
}
