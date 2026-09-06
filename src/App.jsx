import { useState } from 'react'
import { profile, story, education, experiences, projects, skillGroups, languages } from './data'
import Piano from './Piano'
import './App.css'

const NAV_LINKS = [
  { id: 'story', label: 'story' },
  { id: 'play', label: 'play' },
  { id: 'experience', label: 'experience', target: 'work', tab: 'experience' },
  { id: 'projects', label: 'projects', target: 'work', tab: 'projects' },
  { id: 'skills', label: 'skills' },
  { id: 'education', label: 'education' },
  { id: 'contact', label: 'contact' },
]

const IDENTITY = [
  { key: 'school', value: '"UNSW"', type: 'str' },
  { key: 'degree', value: '"Computer Science"', type: 'str' },
  { key: 'major', value: '"Cybersecurity"', type: 'str' },
  { key: 'minor', value: '"Information Systems"', type: 'str' },
  { key: 'graduates', value: '2027', type: 'num' },
  { key: 'based_in', value: '"Sydney, AU"', type: 'str' },
  { key: 'languages', value: '["en", "id", "zh"]', type: 'arr' },
  { key: 'perfect_pitch', value: 'true', type: 'bool' },
]

const GROUP_COLORS = ['#c99a4b', '#4aa79c', '#6f8fc4', '#c47a63']

function Nav({ onSelectTab }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a href="#top" className="nav-brand mono">
          <span className="nav-dots" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-amber" />
            <span className="dot dot-green" />
          </span>
          kevin@sydney<span className="nav-caret">:~$</span> portfolio
        </a>
        <nav className="nav-menu" aria-label="Section navigation">
          <ul className="nav-links mono">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.target ?? link.id}`}
                  onClick={link.tab ? () => onSelectTab(link.tab) : undefined}
                >
                  ./{link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

function IdentityCard() {
  return (
    <aside className="identity" aria-label="Profile summary">
      <div className="identity-bar mono">
        <span className="identity-bar-dot" aria-hidden="true" />
        ~/identity.json
      </div>
      <pre className="identity-code mono">
        <code>
          <span className="tok-punc">{'{'}</span>
          {IDENTITY.map((row) => (
            <span key={row.key} className="identity-line">
              {'  '}
              <span className="tok-key">&quot;{row.key}&quot;</span>
              <span className="tok-punc">: </span>
              <span className={`tok-${row.type}`}>{row.value}</span>
              <span className="tok-punc">,</span>
            </span>
          ))}
          <span className="tok-punc">{'}'}</span>
        </code>
      </pre>
    </aside>
  )
}

function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-inner">
        <div className="hero-main">
          <p className="mono hero-prompt">$ whoami</p>
          <h1 className="hero-name">{profile.name}</h1>

          <p className="mono hero-prompt hero-prompt-secondary">$ cat role.txt</p>
          <p className="hero-role">{profile.tagline}</p>
          <p className="mono hero-location">based in {profile.location}</p>

          <div className="hero-actions">
            <a className="button button-primary" href={`mailto:${profile.email}`}>
              <IconMail />
              Get in touch
            </a>
            <a className="button button-ghost" href={profile.github} target="_blank" rel="noreferrer">
              <IconGithub />
              {profile.githubHandle} on GitHub
            </a>
          </div>
        </div>
        <IdentityCard />
      </div>
    </section>
  )
}

function Section({ id, index, title, variant, children }) {
  return (
    <section id={id} className={`section${variant ? ` section-${variant}` : ''}`}>
      <div className="section-inner">
        <div className="section-rail">
          <p className="mono section-index">sec {index}</p>
          <h2>{title}</h2>
        </div>
        <div className="section-body">{children}</div>
      </div>
    </section>
  )
}

function WaveBand() {
  const bars = [8, 16, 26, 14, 32, 20, 38, 24, 44, 28, 36, 16, 30, 12, 22, 34, 18, 26, 40, 20, 28, 12, 20, 8]
  return (
    <div className="wave-band" aria-hidden="true">
      {bars.map((height, index) => (
        <span
          key={index}
          className="wave-bar"
          style={{ '--bar-height': `${height}px`, '--bar-delay': `${index * 0.05}s` }}
        />
      ))}
    </div>
  )
}

function Story() {
  return (
    <Section id="story" index="01" title="Story">
      <div className="story-grid">
        <div className="story-prose">
          {story.paragraphs.map((paragraph, index) => (
            <p key={index} className="story-paragraph">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="story-aside">
          <blockquote className="pull-quote">
            <span className="pull-quote-mark" aria-hidden="true">
              “
            </span>
            {story.pullQuote}
          </blockquote>

          <div className="languages">
            <p className="mono field-label">languages</p>
            <div className="tag-row">
              {languages.map((lang) => (
                <span key={lang.name} className="tag">
                  {lang.name}
                  <span className="tag-muted">: {lang.level}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Play() {
  return (
    <Section id="play" index="02" title="Play" variant="dark">
      <p className="section-lede">
        Music is where the obsession with getting things exactly right started. Here&apos;s a small piano,
        tuned like everything else on this page until it felt right.
      </p>
      <Piano />
    </Section>
  )
}

const WORK_TABS = [
  { id: 'experience', label: 'experience', count: experiences.length },
  { id: 'projects', label: 'projects', count: projects.length },
]

function Work({ activeTab, onTabChange }) {
  function handleKeyDown(event) {
    const index = WORK_TABS.findIndex((tab) => tab.id === activeTab)
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      onTabChange(WORK_TABS[(index + 1) % WORK_TABS.length].id)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onTabChange(WORK_TABS[(index - 1 + WORK_TABS.length) % WORK_TABS.length].id)
    }
  }

  return (
    <Section id="work" index="03" title="Work">
      <div className="tabs" role="tablist" aria-label="Experience and projects" onKeyDown={handleKeyDown}>
        {WORK_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`tab${activeTab === tab.id ? ' is-active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            ./{tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === 'experience' ? (
        <div role="tabpanel" id="panel-experience" aria-labelledby="tab-experience">
          <ol className="timeline">
            {experiences.map((exp, index) => (
              <li
                key={exp.title}
                className={`timeline-item${index === experiences.length - 1 ? ' timeline-item-last' : ''}`}
              >
                <span className="timeline-node" aria-hidden="true" />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h3>{exp.title}</h3>
                    <span className="mono timeline-period">{exp.period}</span>
                  </div>
                  <ul className="timeline-points">
                    {exp.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div role="tabpanel" id="panel-projects" aria-labelledby="tab-projects">
          <div className="project-grid">
            {projects.map((project, index) => (
              <article
                key={project.title}
                className="project-card"
                style={{ '--card-color': GROUP_COLORS[index % GROUP_COLORS.length] }}
              >
                <div className="project-head">
                  <h3>{project.title}</h3>
                  {project.status ? (
                    <span className="mono project-status">{project.status}</span>
                  ) : null}
                </div>
                <p className="project-description">{project.description}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}

function Skills() {
  return (
    <Section id="skills" index="04" title="Skills" variant="tint">
      <div className="skill-groups">
        {skillGroups.map((group, index) => (
          <div
            key={group.title}
            className="skill-group"
            style={{ '--group-color': GROUP_COLORS[index % GROUP_COLORS.length] }}
          >
            <h3 className="mono skill-group-title">
              <span className="skill-group-dot" aria-hidden="true" />
              {group.title}
            </h3>
            <div className="tag-row">
              {group.skills.map((skill) => (
                <span key={skill} className="tag tag-colored">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Education() {
  return (
    <Section id="education" index="05" title="Education">
      <div className="education-card">
        <div>
          <h3>{education.school}</h3>
          <p className="education-degree">{education.degree}</p>
        </div>
        <span className="mono education-period">{education.period}</span>
      </div>
    </Section>
  )
}

function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="contact-inner">
        <div>
          <p className="mono hero-prompt">$ contact --open</p>
          <h2 className="contact-heading">Get in touch</h2>
          <p className="contact-text">
            Always open to new opportunities, collaborations, and conversations about tech, security, or music.
          </p>
        </div>
        <div className="contact-actions">
          <a className="button button-primary" href={`mailto:${profile.email}`}>
            <IconMail />
            {profile.email}
          </a>
          <a className="button button-ghost" href={profile.github} target="_blank" rel="noreferrer">
            <IconGithub />
            {profile.githubHandle} on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer mono">
      <div className="footer-inner">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="footer-meta">{profile.location}</p>
      </div>
    </footer>
  )
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 6h20v12H2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  )
}

function IconGithub() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.78 10.78.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.13 1.16a10.9 10.9 0 015.7 0c2.17-1.47 3.13-1.16 3.13-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.35.77 1.04.77 2.11 0 1.52-.01 2.75-.01 3.12 0 .3.2.66.79.55 4.51-1.5 7.77-5.76 7.77-10.78C23.02 5.24 18.27.5 12 .5z" />
    </svg>
  )
}

function App() {
  const [workTab, setWorkTab] = useState('experience')

  return (
    <>
      <Nav onSelectTab={setWorkTab} />
      <main>
        <Hero />
        <Story />
        <WaveBand />
        <Play />
        <Work activeTab={workTab} onTabChange={setWorkTab} />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
