import { useEffect, useRef, useState } from 'react'
import {
  profile,
  story,
  identity,
  experiences,
  projects,
  skillGroups,
  languages,
} from './data'
import { playSequence, parseNote } from './piano-engine'

const SECTIONS = [
  { name: 'story', target: 'story', blurb: 'how music turned into code' },
  { name: 'play', target: 'play', blurb: 'an interactive piano' },
  { name: 'experience', target: 'work', tab: 'experience', blurb: 'where I have worked' },
  { name: 'projects', target: 'work', tab: 'projects', blurb: 'what I have built' },
  { name: 'skills', target: 'skills', blurb: 'what I work with' },
  { name: 'education', target: 'education', blurb: 'UNSW, 2024-2027' },
  { name: 'contact', target: 'contact', blurb: 'get in touch' },
]

const COMMANDS = [
  ['help', 'show this list'],
  ['ls', 'list the sections of this site'],
  ['cd <section>', 'jump to a section'],
  ['open <target>', 'cd, or "open github" / "open email"'],
  ['whoami', 'the short version'],
  ['cat <file>', 'about.txt, identity.json, contact.txt'],
  ['projects', 'list projects, with repo links'],
  ['experience', 'list experience'],
  ['skills', 'list skills'],
  ['languages', 'list spoken languages'],
  ['play [notes]', 'play the piano, e.g. "play c e g"'],
  ['date', 'current date'],
  ['echo <text>', 'say it back'],
  ['clear', 'clear the screen'],
  ['exit', 'close the terminal'],
]

const FILES = ['about.txt', 'identity.json', 'contact.txt', 'skills.txt']

const PROMPT = 'kevin@sydney:~$'

function text(value) {
  return { kind: 'text', value }
}

function error(value) {
  return { kind: 'error', value }
}

function Terminal({ open, onClose, onNavigate }) {
  const [lines, setLines] = useState(() => [
    text(`${profile.name.toLowerCase().replace(/ /g, '-')} terminal, v1.0`),
    text('type "help" for a list of commands.'),
  ])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [position, setPosition] = useState(null)
  const [maximized, setMaximized] = useState(false)

  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const windowRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines, open])

  useEffect(() => {
    if (!open) return
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  function print(entries) {
    setLines((prev) => [...prev, ...entries])
  }

  function go(section) {
    onNavigate(section.target, section.tab)
    return [text(`jumping to ${section.name}...`)]
  }

  function run(raw) {
    const trimmed = raw.trim()
    if (!trimmed) return []

    const [command, ...args] = trimmed.split(/\s+/)
    const arg = args.join(' ')
    const name = command.toLowerCase()

    switch (name) {
      case 'help':
        return [
          text('available commands:'),
          ...COMMANDS.map(([cmd, desc]) => ({
            kind: 'pair',
            label: cmd,
            value: desc,
          })),
        ]

      case 'ls':
        return SECTIONS.map((section) => ({
          kind: 'pair',
          label: `${section.name}/`,
          value: section.blurb,
        }))

      case 'cd':
      case 'open': {
        if (!arg) return [error(`${name}: needs a destination. try "ls".`)]
        const key = arg.toLowerCase().replace(/\/$/, '')
        if (key === 'github') {
          window.open(profile.github, '_blank', 'noreferrer')
          return [text(`opening ${profile.github}`)]
        }
        if (key === 'email' || key === 'mail') {
          window.location.href = `mailto:${profile.email}`
          return [text(`opening mail to ${profile.email}`)]
        }
        if (key === '~' || key === 'home' || key === 'top' || key === '..') {
          onNavigate('top')
          return [text('back to the top.')]
        }
        const section = SECTIONS.find((s) => s.name === key)
        if (!section) return [error(`${name}: no such section: ${arg}`)]
        return go(section)
      }

      case 'whoami':
        return [
          text(profile.name),
          text(profile.tagline),
          text(`based in ${profile.location}`),
          text(`github: ${profile.githubHandle}`),
        ]

      case 'cat': {
        if (!arg) return [error(`cat: needs a file. try: ${FILES.join(', ')}`)]
        const file = arg.toLowerCase()
        if (file === 'about.txt') {
          return story.paragraphs.map((p) => text(p.replace(/\s+/g, ' ').trim()))
        }
        if (file === 'identity.json') {
          return [
            text('{'),
            ...identity.map((row) => text(`  "${row.key}": ${row.value},`)),
            text('}'),
          ]
        }
        if (file === 'contact.txt') {
          return [text(`email:  ${profile.email}`), text(`github: ${profile.github}`)]
        }
        if (file === 'skills.txt') {
          return skillGroups.map((group) => ({
            kind: 'pair',
            label: group.title,
            value: group.skills.join(', '),
          }))
        }
        return [error(`cat: no such file: ${arg}`)]
      }

      case 'projects':
        return projects.flatMap((project) => [
          {
            kind: 'project',
            title: project.title,
            status: project.status,
            url: project.url,
            description: project.description,
          },
        ])

      case 'experience':
        return experiences.map((exp) => ({
          kind: 'pair',
          label: exp.period,
          value: exp.title,
        }))

      case 'skills':
        return skillGroups.map((group) => ({
          kind: 'pair',
          label: group.title,
          value: group.skills.join(', '),
        }))

      case 'languages':
        return languages.map((lang) => ({
          kind: 'pair',
          label: lang.name,
          value: lang.level,
        }))

      case 'play': {
        const tokens = args.length ? args : ['c', 'e', 'g', 'c5']
        const notes = tokens.map(parseNote)
        const bad = tokens.filter((_, i) => notes[i] === null)
        if (bad.length) {
          return [
            error(`play: not a note: ${bad.join(', ')}`),
            text(`try letters a-g, optional # and octave 4-5, e.g. "play c e g c5"`),
          ]
        }
        playSequence(notes)
        return [text(`playing ${notes.join(' ')}`)]
      }

      case 'date':
        return [text(new Date().toString())]

      case 'echo':
        return [text(arg)]

      case 'clear':
        setLines([])
        return []

      case 'exit':
      case 'quit':
      case 'close':
        onClose()
        return []

      case 'sudo':
        return [text('nice try.')]

      case 'pwd':
        return [text('/home/kevin/portfolio')]

      default:
        return [error(`command not found: ${command}. type "help".`)]
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const entry = input
    const wasClear = entry.trim().toLowerCase() === 'clear'
    const output = run(entry)

    if (!wasClear) {
      print([{ kind: 'command', value: entry }, ...output])
    }
    if (entry.trim()) {
      setCommandHistory((prev) => [...prev, entry])
    }
    setHistoryIndex(-1)
    setInput('')
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!commandHistory.length) return
      const next = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(next)
      setInput(commandHistory[next])
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (historyIndex === -1) return
      const next = historyIndex + 1
      if (next >= commandHistory.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(next)
        setInput(commandHistory[next])
      }
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      const parts = input.split(/\s+/)
      if (parts.length <= 1) {
        const pool = COMMANDS.map(([cmd]) => cmd.split(' ')[0])
        const match = pool.find((c) => c.startsWith(parts[0]) && parts[0])
        if (match) setInput(match + ' ')
      } else {
        const last = parts[parts.length - 1]
        const pool = parts[0] === 'cat' ? FILES : SECTIONS.map((s) => s.name)
        const match = pool.find((c) => c.startsWith(last) && last)
        if (match) setInput([...parts.slice(0, -1), match].join(' '))
      }
    }
  }

  function handleDragStart(event) {
    // Let the traffic-light buttons receive their own clicks; capturing the
    // pointer on the bar would retarget them and swallow the click.
    if (event.target instanceof Element && event.target.closest('button')) return
    if (maximized) return
    const rect = windowRef.current.getBoundingClientRect()
    dragRef.current = { dx: event.clientX - rect.left, dy: event.clientY - rect.top }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleDragMove(event) {
    if (!dragRef.current) return
    const width = windowRef.current.offsetWidth
    const height = windowRef.current.offsetHeight
    const x = Math.min(Math.max(0, event.clientX - dragRef.current.dx), window.innerWidth - width)
    const y = Math.min(Math.max(0, event.clientY - dragRef.current.dy), window.innerHeight - height)
    setPosition({ x, y })
  }

  function handleDragEnd(event) {
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  if (!open) return null

  const style = position && !maximized ? { left: `${position.x}px`, top: `${position.y}px`, right: 'auto', bottom: 'auto' } : undefined

  return (
    <div
      className={`term${maximized ? ' is-maximized' : ''}`}
      style={style}
      ref={windowRef}
      role="dialog"
      aria-label="Interactive terminal"
    >
      <div
        className="term-bar"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <span className="term-lights">
          <button type="button" className="term-light term-close" onClick={onClose} aria-label="Close terminal" />
          <button
            type="button"
            className="term-light term-min"
            onClick={() => setMaximized(false)}
            aria-label="Restore size"
          />
          <button
            type="button"
            className="term-light term-max"
            onClick={() => setMaximized((v) => !v)}
            aria-label="Toggle maximise"
          />
        </span>
        <span className="term-title mono">kevin@sydney: ~/portfolio</span>
      </div>

      <div className="term-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
        {lines.map((line, index) => {
          if (line.kind === 'command') {
            return (
              <div key={index} className="term-line">
                <span className="term-prompt">{PROMPT}</span> {line.value}
              </div>
            )
          }
          if (line.kind === 'error') {
            return (
              <div key={index} className="term-line term-error">
                {line.value}
              </div>
            )
          }
          if (line.kind === 'pair') {
            return (
              <div key={index} className="term-line term-pair">
                <span className="term-key">{line.label}</span>
                <span className="term-value">{line.value}</span>
              </div>
            )
          }
          if (line.kind === 'project') {
            return (
              <div key={index} className="term-line term-project">
                <span className="term-key">
                  {line.title}
                  {line.status ? <span className="term-badge">{line.status}</span> : null}
                </span>
                <span className="term-value">{line.description}</span>
                {line.url ? (
                  <a className="term-link" href={line.url} target="_blank" rel="noreferrer">
                    {line.url}
                  </a>
                ) : null}
              </div>
            )
          }
          return (
            <div key={index} className="term-line">
              {line.value}
            </div>
          )
        })}

        <form className="term-input-row" onSubmit={handleSubmit}>
          <span className="term-prompt">{PROMPT}</span>
          <input
            ref={inputRef}
            className="term-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Terminal input"
          />
        </form>
      </div>
    </div>
  )
}

export default Terminal
