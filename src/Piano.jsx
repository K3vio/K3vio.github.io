import { useEffect, useMemo, useRef, useState } from 'react'

const WHITE_NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']

const BLACK_NOTES = [
  { note: 'C#4', key: 'w', left: 9.0 },
  { note: 'D#4', key: 'e', left: 21.5 },
  { note: 'F#4', key: 't', left: 46.5 },
  { note: 'G#4', key: 'y', left: 59.0 },
  { note: 'A#4', key: 'u', left: 71.5 },
]

const WHITE_KEYS = { a: 'C4', s: 'D4', d: 'E4', f: 'F4', g: 'G4', h: 'A4', j: 'B4', k: 'C5' }
const BLACK_KEYS = Object.fromEntries(BLACK_NOTES.map(({ note, key }) => [key, note]))
const KEY_TO_NOTE = { ...WHITE_KEYS, ...BLACK_KEYS }
const NOTE_TO_KEY = Object.fromEntries(Object.entries(KEY_TO_NOTE).map(([k, n]) => [n, k]))

const NOTE_FREQ = {
  C4: 261.63,
  'C#4': 277.18,
  D4: 293.66,
  'D#4': 311.13,
  E4: 329.63,
  F4: 349.23,
  'F#4': 369.99,
  G4: 392.0,
  'G#4': 415.3,
  A4: 440.0,
  'A#4': 466.16,
  B4: 493.88,
  C5: 523.25,
}

function usePianoEngine() {
  const ctxRef = useRef(null)
  const voicesRef = useRef(new Map())

  function getContext() {
    if (!ctxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      ctxRef.current = new AudioContextClass()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }

  function noteOn(note) {
    if (voicesRef.current.has(note)) return
    const ctx = getContext()
    const now = ctx.currentTime
    const freq = NOTE_FREQ[note]

    const master = ctx.createGain()
    master.gain.setValueAtTime(0, now)
    master.gain.linearRampToValueAtTime(0.3, now + 0.008)
    master.gain.linearRampToValueAtTime(0.16, now + 0.18)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 3400
    filter.Q.value = 0.6

    master.connect(filter)
    filter.connect(ctx.destination)

    const layers = [
      { type: 'sine', freq, detune: 0, gain: 1 },
      { type: 'triangle', freq, detune: 5, gain: 0.32 },
      { type: 'sine', freq: freq * 2, detune: 0, gain: 0.1 },
    ]

    const oscillators = layers.map(({ type, freq: f, detune, gain }) => {
      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.value = f
      osc.detune.value = detune
      const gainNode = ctx.createGain()
      gainNode.gain.value = gain
      osc.connect(gainNode)
      gainNode.connect(master)
      osc.start(now)
      return osc
    })

    voicesRef.current.set(note, { oscillators, master })
  }

  function noteOff(note) {
    const voice = voicesRef.current.get(note)
    if (!voice) return
    const ctx = getContext()
    const now = ctx.currentTime
    voice.master.gain.cancelScheduledValues(now)
    voice.master.gain.setValueAtTime(voice.master.gain.value, now)
    voice.master.gain.linearRampToValueAtTime(0, now + 0.35)
    voice.oscillators.forEach((osc) => osc.stop(now + 0.4))
    voicesRef.current.delete(note)
  }

  function stopAll() {
    Array.from(voicesRef.current.keys()).forEach(noteOff)
  }

  useEffect(() => stopAll, [])

  return { noteOn, noteOff, stopAll }
}

function Piano() {
  const { noteOn, noteOff, stopAll } = usePianoEngine()
  const [heldKeys, setHeldKeys] = useState(() => new Set())
  const [pointerNote, setPointerNote] = useState(null)
  const [lastNote, setLastNote] = useState(null)
  const pointerActiveRef = useRef(false)

  const activeNotes = useMemo(() => {
    const set = new Set(heldKeys)
    if (pointerNote) set.add(pointerNote)
    return set
  }, [heldKeys, pointerNote])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.repeat) return
      const note = KEY_TO_NOTE[event.key.toLowerCase()]
      if (!note) return
      noteOn(note)
      setLastNote(note)
      setHeldKeys((prev) => new Set(prev).add(note))
    }

    function handleKeyUp(event) {
      const note = KEY_TO_NOTE[event.key.toLowerCase()]
      if (!note) return
      noteOff(note)
      setHeldKeys((prev) => {
        const next = new Set(prev)
        next.delete(note)
        return next
      })
    }

    function handleBlur() {
      stopAll()
      setHeldKeys(new Set())
      setPointerNote(null)
      pointerActiveRef.current = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('pointerup', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('pointerup', handleBlur)
    }
  }, [noteOn, noteOff, stopAll])

  function playFromPointer(note) {
    if (pointerNote === note) return
    if (pointerNote) noteOff(pointerNote)
    noteOn(note)
    setPointerNote(note)
    setLastNote(note)
  }

  function releasePointer() {
    if (pointerNote) noteOff(pointerNote)
    setPointerNote(null)
    pointerActiveRef.current = false
  }

  function handlePointerDown(note) {
    pointerActiveRef.current = true
    playFromPointer(note)
  }

  function handlePointerEnter(note) {
    if (pointerActiveRef.current) playFromPointer(note)
  }

  return (
    <div className="piano">
      <div className="piano-readout">
        <span className="piano-readout-label">now playing</span>
        <span className="piano-readout-note">{lastNote ?? '—'}</span>
        <span className="piano-readout-tuning">A4 = 440Hz</span>
      </div>
      <div className="piano-scroll">
        <div className="piano-keys" onPointerLeave={releasePointer}>
          {WHITE_NOTES.map((note) => (
            <button
              key={note}
              type="button"
              aria-label={`Play ${note}`}
              className={`piano-key piano-key-white${activeNotes.has(note) ? ' is-active' : ''}`}
              onPointerDown={() => handlePointerDown(note)}
              onPointerEnter={() => handlePointerEnter(note)}
              onPointerUp={releasePointer}
            >
              <span className="piano-key-hint">{NOTE_TO_KEY[note]}</span>
            </button>
          ))}
          {BLACK_NOTES.map(({ note, left }) => (
            <button
              key={note}
              type="button"
              aria-label={`Play ${note}`}
              style={{ left: `${left}%` }}
              className={`piano-key piano-key-black${activeNotes.has(note) ? ' is-active' : ''}`}
              onPointerDown={() => handlePointerDown(note)}
              onPointerEnter={() => handlePointerEnter(note)}
              onPointerUp={releasePointer}
            >
              <span className="piano-key-hint">{NOTE_TO_KEY[note]}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="piano-caption">
        click the keys, or play with your keyboard — <span className="mono">a s d f g h j k</span> for white,{' '}
        <span className="mono">w e t y u</span> for black.
      </p>
    </div>
  )
}

export default Piano
