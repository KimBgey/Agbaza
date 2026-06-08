import { useState, useEffect, useRef, useCallback } from 'react'

export function useRestTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [total, setTotal] = useState(0)
  const intervalRef = useRef(null)
  const audioCtxRef = useRef(null)

  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch (_) {}
    if (navigator.vibrate) navigator.vibrate([200, 100, 200])
  }, [])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          playBeep()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, playBeep])

  const start = useCallback((duration) => {
    setTotal(duration)
    setSeconds(duration)
    setRunning(true)
  }, [])

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSeconds(0)
    setTotal(0)
  }, [])

  const progress = total > 0 ? ((total - seconds) / total) * 100 : 0

  return { seconds, running, total, progress, start, stop }
}

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const startRef = useRef(null)
  const intervalRef = useRef(null)

  const start = useCallback(() => {
    startRef.current = Date.now() - elapsed * 1000
    setRunning(true)
  }, [elapsed])

  const startFrom = useCallback((initialSeconds) => {
    setElapsed(initialSeconds)
    startRef.current = Date.now() - initialSeconds * 1000
    setRunning(true)
  }, [])

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setElapsed(0)
  }, [])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return { elapsed, minutes, seconds, formatted, running, start, startFrom, stop, reset }
}
