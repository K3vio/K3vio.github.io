export const profile = {
  name: 'Kevin Sebastian Tukgali',
  tagline: 'Computer Science Student, Security Engineering',
  location: 'Sydney, Australia',
  email: 'kevin.s.t2006@gmail.com',
  github: 'https://github.com/K3vio',
  githubHandle: 'K3vio',
}

export const story = {
  paragraphs: [
    `Hi, I'm Kevin, a Computer Science undergrad at UNSW who originally wanted to
    pursue music but fell in love with the terminal instead. I grew up with
    instruments and computers in equal measure; gaming was a huge part of my
    childhood, and it's probably where the two interests first tangled together.`,
    `Now I'm specialising in Security Engineering with a minor in Information Systems,
    picking apart systems the same way I used to pick apart chords. Experienced
    in collaborative, project-based environments through hackathons and personal
    builds, and always looking to learn through real world experience and feedback.`,
    `My long-term goal is to build creative, meaningful software. Music just
    happens to be where that obsession began.`,
  ],
  pullQuote: 'I have perfect pitch, which means I tend to notice small details. That habit carries into how I code: I fine-tune things until they feel right.',
}

export const identity = [
  { key: 'school', value: '"UNSW"', type: 'str' },
  { key: 'major', value: '"Computer Science"', type: 'str' },
  { key: 'specialisation', value: '"Security Engineering"', type: 'str' },
  { key: 'minor', value: '"Information Systems"', type: 'str' },
  { key: 'graduates', value: '2027', type: 'num' },
  { key: 'based_in', value: '"Sydney, AU"', type: 'str' },
  { key: 'languages', value: '["en", "id", "zh"]', type: 'arr' },
  { key: 'perfect_pitch', value: 'true', type: 'bool' },
]

export const education = {
  degree: 'Bachelor of Computer Science (Security Engineering), Minor in Information Systems',
  school: 'University of New South Wales',
  period: '2024-2027',
}

export const experiences = [
  {
    title: 'LifeGrain Kitchen',
    period: '2026',
    points: ['Handled food prep for the LifeGrain group.'],
  },
  {
    title: 'Finalist, Lyra x ICON Hackathon',
    period: '2026',
    points: [
      'Developed a smart AI-powered calendar app that reached the top 8 teams going into the finalist rounds, hosted at LYRA’s office.',
    ],
  },
  {
    title: 'Kitchen Hand & Waitstaff, Mamak’s Village Restaurant',
    period: '2025',
    points: [
      'Handled dual kitchen hand and front-of-house duties in a fast-paced restaurant, preparing food to standard while serving customers and managing enquiries.',
    ],
  },
  {
    title: 'Finalist, Atlassian Case Crack',
    period: '2025',
    points: [
      'Competed in a team of four in a competitive case challenge, collaborating to solve real world business and tech scenarios.',
    ],
  },
  {
    title: 'Intern, Jakarta Suzuki (PT Citra Asri Buana)',
    period: '2023',
    points: [
      'Assisted in sales operations and managed inventory data using SQL-based internal systems to track vehicle parts and stock levels.',
      'Gained experience in database management and sales.',
    ],
  },
  {
    title: 'Discord Bot Developer',
    period: '2022',
    points: [
      'Built a Python Discord bot using discord.py with automated moderation, user management, and role-based permissions across multiple servers.',
      'Gained experience with asynchronous programming and API integration.',
    ],
  },
  {
    title: 'Finalist, World Scholars Cup Global Round',
    period: '2020',
    points: [
      'Competed at Yale University, qualifying as a finalist in the debate category.',
      'Developed skills in critical thinking, public speaking, and structured argumentation in an international academic competition.',
    ],
  },
]

export const projects = [
  {
    title: 'Benchmarking AI Agent Security',
    status: 'Ongoing',
    description:
      'Testing whether autonomous AI agents can be tricked into executing actions against their guidelines.',
  },
  {
    title: 'Research Paper: AI and Misinformation',
    status: 'Ongoing',
    description:
      'Writing a research paper on how AI models respond to misinformation.',
  },
  {
    title: 'LLMs Misinformation Detector',
    description: 'Built a multi LLM misinformation analysis tool.',
    url: 'https://github.com/K3vio/LLM-Misinformation-Detector',
  },
  {
    title: 'Smart Meeting Summarizer',
    description:
      'Live meeting transcription and summarisation, built with the Mistral API.',
    url: 'https://github.com/K3vio/MeetSumAI',
  },
  {
    title: 'AI Powered Smart Calendar',
    description:
      'Plans meetings for users and provides scheduling suggestions. Built for the Lyra x ICON Hackathon.',
    url: 'https://github.com/K3vio/FlowCalAI',
  },
  {
    title: 'CSS Battle Certification',
    status: 'Completed',
    description: 'Finished the CSS Battle course.',
  },
]

export const skillGroups = [
  {
    title: 'Programming',
    skills: ['C', 'JavaScript', 'Python', 'Java', 'Shell', 'SQL', 'Web Design & CSS'],
  },
  {
    title: 'Tools & Tech',
    skills: ['Microsoft Office', 'Canva', 'Troubleshooting', 'Video Editing', 'Social Media Management'],
  },
  {
    title: 'Interpersonal',
    skills: ['Customer Service', 'Teamwork', 'Communication'],
  },
  {
    title: 'Other',
    skills: ['Music Theory', 'Music Practical', 'Perfect Pitch'],
  },
]

export const languages = [
  { name: 'English', level: 'Fluent / Native' },
  { name: 'Indonesian', level: 'Fluent / Native' },
  { name: 'Mandarin', level: 'Basic Conversational' },
]
