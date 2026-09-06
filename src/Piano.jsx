import { useEffect, useMemo, useRef, useState } from 'react'
import { noteOn, noteOff, stopAll } from './piano-engine'

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

/** True when the user is typing somewhere, so letter keys are not piano keys. */
function isTypingTarget(target) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function Piano() {
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
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
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

    function handleRelease() {
      stopAll()
      setHeldKeys(new Set())
      setPointerNote(null)
      pointerActiveRef.current = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleRelease)
    window.addEventListener('pointerup', handleRelease)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleRelease)
      window.removeEventListener('pointerup', handleRelease)
    }
  }, [])

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
        <span className="piano-readout-note">{lastNote ?? '--'}</span>
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
        click the keys, or play with your keyboard: <span className="mono">a s d f g h j k</span> for white,{' '}
        <span className="mono">w e t y u</span> for black.
      </p>
    </div>
  )
}

export default Piano
