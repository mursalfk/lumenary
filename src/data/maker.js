// src/data/maker.js
// The words of the About page. Written in the first person, so edit freely: it is all plain text.
// Only things that are public belong here: no phone numbers, no email, nothing unannounced.

export const MAKER = {
  name: 'Mursal Furqan Kumbhar',
  tagline: 'A weekend project that kept growing.',
  intro:
    'Lumenary began with one question: how many honest ways are there to read a photograph? ' +
    'A picture is a grid of numbers, and every treatment here is a different way of reading them.',
};

// The maker, in a few paragraphs.
export const WHO = {
  title: 'Who made this',
  paragraphs: [
    'Hi, I am Furqan... Mursal Furqan Kumbhar on paper, and friends say Furqan with a long a. I design and build AI systems and full-stack software.',
    'My roots are in Sindh. Sindhi and Urdu run deep in how I think and write, and so do the Sufi poets, Shah Abdul Latif Bhittai among them. Lumenary is where those worlds meet: careful engineering, and a love of craft and pattern.',
  ],
};

// A short list of facts. Each `label` is a plain heading, each `text` one sentence.
export const FACTS = [
  { label: 'Work', text: 'AI systems architect and full-stack engineer.' },
  { label: 'Research', text: 'Formerly a research fellow at mathLab, SISSA.' },
  { label: 'Studied', text: 'Computer science and engineering at MUET.' },
  { label: 'Community', text: 'AWS Community Builder in the ML and AI category. Lead organiser of the AWS User Group Karachi. President of Hack Club. Active in Rotaract.' },
  { label: 'Teaching', text: 'I have taught for years, including as a Microsoft Innovative Educator Master Trainer.' },
  { label: 'Writing', text: 'More than a hundred articles on Dev.to, and more on Medium, LinkedIn and AWS Builder Center.' },
];

// Public projects. `href` is an external link; `to` is a page on this site.
export const PROJECTS = [
  {
    title: 'Lumenary',
    text: 'This studio. A browser-only image workshop, with the theory written out for every treatment. It was meant to take a weekend.',
    meta: 'You are here',
    to: '/theory',
  },
  {
    title: 'Tech Dastaan',
    text: 'Short videos on how everyday technology works inside: why you get logged out, where a deleted file goes, why a payment was charged twice.',
    meta: 'Instagram, TikTok, YouTube',
    href: 'https://mursalfk.github.io/linkin.bio',
  },
  {
    title: 'The Accountant',
    text: 'A small AI agent that reads my AWS bill every day, written up as a series: how it was built, how it moved from Bedrock Agents Classic to AgentCore, and how I tried to break it. Featured by AWS in the Community Builders Spotlight 5 Timers Club.',
    meta: 'Articles on Dev.to',
    href: 'https://dev.to/mursalfk',
  },
  {
    title: 'Court of Facts: AWS Edition',
    text: 'A benchmark that tries to gaslight local AI models about live AWS facts, wrapped in a pixel-art tournament game.',
    meta: 'Article and code',
    href: 'https://dev.to/aws-builders/can-you-gaslight-an-ai-about-aws-i-built-a-game-to-find-out-4o03',
  },
  {
    title: 'The Ledger That Charged Twice',
    text: 'An S3 event that can arrive twice, a Lambda that charged twice because of it, and the idempotency fix that stops it.',
    meta: 'Code on GitHub',
    href: 'https://github.com/mursalfk/idempotent-s3',
  },
];

// Why Lumenary, and why a Sindhi section.
export const WHY = {
  title: 'Why this exists',
  paragraphs: [
    'Most photo editors keep their workings out of sight. I wanted the opposite: a place where each effect is built from scratch, in plain sight, and where the equation on the theory page is the one the code actually runs.',
    'It started with twenty treatments. Then a list of ideas arrived and would not leave, and the weekend stretched. Everything runs in your browser, so your pictures never leave your device, and there are no accounts to make.',
  ],
  quote: 'A photograph is a grid of numbers. This is a place to read them in as many ways as I could think of.',
};

export const SINDH = {
  title: 'Why there is a Sindhi section',
  paragraphs: [
    'Sindh has some of the oldest craft traditions anywhere, from the seals of Mohenjo-daro to the ajrak worn on a shoulder today, and they rarely show up in image tools. So section L holds nine of them, with the dye, thread, stone and clay that give each one its look.',
    'I am no master of any of these crafts. I read about them, I look closely, and I try to be careful. If I have got something wrong, tell me. I would rather fix it than leave it.',
  ],
  link: { to: '/section/sindhi', label: 'See the Sindhi section' },
};

// Principles shown as short columns.
export const PRINCIPLES = [
  { title: 'Private', text: 'Your picture is drawn and processed right here in the browser. Nothing is uploaded, and there is no account to make.' },
  { title: 'Open about the maths', text: 'Each treatment has a theory page with the equations the code runs, a short history, and where it is used.' },
  { title: 'Careful with traditions', text: 'The crafts of other cultures are living, not decoration. Each page says where a tradition comes from, borrows only how it looks, and points to the people who still make it.' },
  { title: 'Yours to keep', text: 'Save any result as a PNG. Live treatments can also record a short WebM clip to take with you.' },
];

// What it is made of.
export const COLOPHON = {
  title: 'Colophon',
  lines: [
    { label: 'Type', text: 'Set in Bodoni Moda, Hanken Grotesk and DM Mono. Some treatments bring their own: Noto Naskh Arabic, Caveat, Pinyon Script and JetBrains Mono.' },
    { label: 'Made with', text: 'React, Vite, Sass, motion, Lenis and KaTeX. Every treatment is a small piece of plain canvas code, with no machine learning model behind it.' },
    { label: 'Hosted on', text: 'Vercel. The pictures you open never reach it.' },
  ],
};

// Where to find the maker. Only links that are confirmed.
export const LINKS = {
  title: 'Find me',
  text: 'If a tradition is wrong, a treatment is broken, or there is something you wish it did, say so. The portfolio is the best way to reach me.',
  items: [
    { label: 'Portfolio', href: 'https://mursalfk.vercel.app' },
    { label: 'GitHub', href: 'https://github.com/mursalfk' },
    { label: 'Dev.to', href: 'https://dev.to/mursalfk' },
    { label: 'Tech Dastaan', href: 'https://mursalfk.github.io/linkin.bio' },
  ],
};
