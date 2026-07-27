export interface DailyVerse {
  id: string;
  reference: string; // e.g. "Joshua 1:9"
  text: string;
  translation: string; // e.g. "ESV"
}

export interface DailyQuote {
  id: string;
  quote: string;
  author: string;
  category?: string;
}

export const CURATED_VERSES: DailyVerse[] = [
  {
    id: 'v1',
    reference: 'Joshua 1:9',
    text: 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.',
    translation: 'ESV',
  },
  {
    id: 'v2',
    reference: 'Proverbs 3:5-6',
    text: 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
    translation: 'ESV',
  },
  {
    id: 'v3',
    reference: 'Colossians 3:23',
    text: 'Whatever you do, work heartily, as for the Lord and not for men.',
    translation: 'ESV',
  },
  {
    id: 'v4',
    reference: 'Isaiah 40:31',
    text: 'But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.',
    translation: 'ESV',
  },
  {
    id: 'v5',
    reference: 'Philippians 4:13',
    text: 'I can do all things through him who strengthens me.',
    translation: 'ESV',
  },
  {
    id: 'v6',
    reference: 'Psalm 119:105',
    text: 'Your word is a lamp to my feet and a light to my path.',
    translation: 'ESV',
  },
  {
    id: 'v7',
    reference: 'Galatians 6:9',
    text: 'And let us not grow weary of doing good, for in due season we will reap, if we do not give up.',
    translation: 'ESV',
  },
  {
    id: 'v8',
    reference: 'Romans 12:2',
    text: 'Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.',
    translation: 'ESV',
  },
  {
    id: 'v9',
    reference: 'Matthew 11:28',
    text: 'Come to me, all who labor and are heavy laden, and I will give you rest.',
    translation: 'ESV',
  },
  {
    id: 'v10',
    reference: 'Psalm 46:10',
    text: 'Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!',
    translation: 'ESV',
  },
  {
    id: 'v11',
    reference: '2 Timothy 1:7',
    text: 'For God gave us a spirit not of fear but of power and love and self-control.',
    translation: 'ESV',
  },
  {
    id: 'v12',
    reference: 'Hebrews 12:1-2',
    text: 'Let us run with endurance the race that is set before us, looking to Jesus, the founder and perfecter of our faith.',
    translation: 'ESV',
  },
];

export const CURATED_QUOTES: DailyQuote[] = [
  {
    id: 'q1',
    quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
    category: 'Excellence',
  },
  {
    id: 'q2',
    quote: 'Focus on being productive instead of busy.',
    author: 'Tim Ferriss',
    category: 'Productivity',
  },
  {
    id: 'q3',
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    category: 'Systems',
  },
  {
    id: 'q4',
    quote: 'It is not that we have a short time to live, but that we waste a lot of it.',
    author: 'Seneca',
    category: 'Wisdom',
  },
  {
    id: 'q5',
    quote: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
    category: 'Action',
  },
  {
    id: 'q6',
    quote: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
    category: 'Engineering',
  },
  {
    id: 'q7',
    quote: 'Small daily improvements over time lead to stunning results.',
    author: 'Robin Sharma',
    category: 'Growth',
  },
];

function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getVerseOfTheDay(date: Date = new Date()): DailyVerse {
  const dayIndex = getDayOfYear(date);
  return CURATED_VERSES[dayIndex % CURATED_VERSES.length];
}

export function getRandomVerse(currentId?: string): DailyVerse {
  const filtered = CURATED_VERSES.filter((v) => v.id !== currentId);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || CURATED_VERSES[0];
}

export function getQuoteOfTheDay(date: Date = new Date()): DailyQuote {
  const dayIndex = getDayOfYear(date);
  return CURATED_QUOTES[dayIndex % CURATED_QUOTES.length];
}
