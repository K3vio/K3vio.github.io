export const NOTE_FREQ = {
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

let context = null
const voices = new Map()

function getContext() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    context = new AudioContextClass()
  }
  if (context.state === 'suspended') {
    context.resume()
  }
  return context
}

export function noteOn(note) {
  if (!NOTE_FREQ[note] || voices.has(note)) return
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

  voices.set(note, { oscillators, master })
}

export function noteOff(note) {
  const voice = voices.get(note)
  if (!voice) return
  const ctx = getContext()
  const now = ctx.currentTime
  voice.master.gain.cancelScheduledValues(now)
  voice.master.gain.setValueAtTime(voice.master.gain.value, now)
  voice.master.gain.linearRampToValueAtTime(0, now + 0.35)
  voice.oscillators.forEach((osc) => osc.stop(now + 0.4))
  voices.delete(note)
}

export function stopAll() {
  Array.from(voices.keys()).forEach(noteOff)
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function playSequence(notes, { gap = 260, hold = 420 } = {}) {
  for (const note of notes) {
    noteOn(note)
    setTimeout(() => noteOff(note), hold)
    await delay(gap)
  }
}

/** Turn "c", "f#", "c5" into a key of NOTE_FREQ, or null. */
export function parseNote(token) {
  const match = /^([a-gA-G])(#|s)?([45])?$/.exec(token.trim())
  if (!match) return null
  const [, letter, sharp, octave] = match
  const note = `${letter.toUpperCase()}${sharp ? '#' : ''}${octave ?? '4'}`
  return NOTE_FREQ[note] ? note : null
}
