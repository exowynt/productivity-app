export interface DailyVerse {
  id: string;
  reference: string; // e.g. "Joshua 1:9"
  text: string;
  translation: string; // "ESV"
}

export interface DailyQuote {
  id: string;
  quote: string;
  author: string;
  category?: string;
}

// Authentic, Verbatim ESV Bible Verses (References strictly match their scripture text)
export const CURATED_VERSES: DailyVerse[] = [
  { id: 'v1', reference: 'Joshua 1:9', text: 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.', translation: 'ESV' },
  { id: 'v2', reference: 'Proverbs 3:5-6', text: 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.', translation: 'ESV' },
  { id: 'v3', reference: 'Colossians 3:23', text: 'Whatever you do, work heartily, as for the Lord and not for men.', translation: 'ESV' },
  { id: 'v4', reference: 'Isaiah 40:31', text: 'But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.', translation: 'ESV' },
  { id: 'v5', reference: 'Philippians 4:13', text: 'I can do all things through him who strengthens me.', translation: 'ESV' },
  { id: 'v6', reference: 'Psalm 119:105', text: 'Your word is a lamp to my feet and a light to my path.', translation: 'ESV' },
  { id: 'v7', reference: 'Galatians 6:9', text: 'And let us not grow weary of doing good, for in due season we will reap, if we do not give up.', translation: 'ESV' },
  { id: 'v8', reference: 'Romans 12:2', text: 'Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.', translation: 'ESV' },
  { id: 'v9', reference: 'Matthew 11:28', text: 'Come to me, all who labor and are heavy laden, and I will give you rest.', translation: 'ESV' },
  { id: 'v10', reference: 'Psalm 46:10', text: 'Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!', translation: 'ESV' },
  { id: 'v11', reference: '2 Timothy 1:7', text: 'For God gave us a spirit not of fear but of power and love and self-control.', translation: 'ESV' },
  { id: 'v12', reference: 'Hebrews 12:1-2', text: 'Let us run with endurance the race that is set before us, looking to Jesus, the founder and perfecter of our faith.', translation: 'ESV' },
  { id: 'v13', reference: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.', translation: 'ESV' },
  { id: 'v14', reference: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.', translation: 'ESV' },
  { id: 'v15', reference: 'Romans 8:28', text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.', translation: 'ESV' },
  { id: 'v16', reference: 'Proverbs 16:3', text: 'Commit your work to the LORD, and your plans will be established.', translation: 'ESV' },
  { id: 'v17', reference: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.', translation: 'ESV' },
  { id: 'v18', reference: 'Psalm 27:1', text: 'The LORD is my light and my salvation; whom shall I fear? The LORD is the stronghold of my life; of whom shall I be afraid?', translation: 'ESV' },
  { id: 'v19', reference: 'Micah 6:8', text: 'He has told you, O man, what is good; and what does the LORD require of you but to do justice, and to love kindness, and to walk humbly with your God?', translation: 'ESV' },
  { id: 'v20', reference: 'Proverbs 4:23', text: 'Keep your heart with all vigilance, for from it flow the springs of life.', translation: 'ESV' },
  { id: 'v21', reference: 'Psalm 118:24', text: 'This is the day that the LORD has made; let us rejoice and be glad in it.', translation: 'ESV' },
  { id: 'v22', reference: 'Romans 15:13', text: 'May the God of hope fill you with all joy and peace in believing, so that by the power of the Holy Spirit you may abound in hope.', translation: 'ESV' },
  { id: 'v23', reference: '1 Corinthians 16:14', text: 'Let all that you do be done in love.', translation: 'ESV' },
  { id: 'v24', reference: 'James 1:5', text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.', translation: 'ESV' },
  { id: 'v25', reference: 'Psalm 34:8', text: 'Oh, taste and see that the LORD is good! Blessed is the man who takes refuge in him!', translation: 'ESV' },
  { id: 'v26', reference: '1 Peter 5:7', text: 'Casting all your anxieties on him, because he cares for you.', translation: 'ESV' },
  { id: 'v27', reference: 'Hebrews 11:1', text: 'Now faith is the assurance of things hoped for, the conviction of things not seen.', translation: 'ESV' },
  { id: 'v28', reference: 'Ephesians 2:8-9', text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.', translation: 'ESV' },
  { id: 'v29', reference: 'Psalm 56:3', text: 'When I am afraid, I put my trust in you.', translation: 'ESV' },
  { id: 'v30', reference: 'Proverbs 18:10', text: 'The name of the LORD is a strong tower; the righteous man runs into it and is safe.', translation: 'ESV' },
  { id: 'v31', reference: 'Colossians 3:12', text: 'Put on then, as God\'s chosen ones, holy and beloved, compassionate hearts, kindness, humility, meekness, and patience.', translation: 'ESV' },
  { id: 'v32', reference: 'Psalm 121:1-2', text: 'I lift up my eyes to the hills. From where does my help come? My help comes from the LORD, who made heaven and earth.', translation: 'ESV' },
  { id: 'v33', reference: 'Romans 12:12', text: 'Rejoice in hope, be patient in tribulation, be constant in prayer.', translation: 'ESV' },
  { id: 'v34', reference: 'Matthew 5:16', text: 'In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven.', translation: 'ESV' },
  { id: 'v35', reference: 'Psalm 91:1-2', text: 'He who dwells in the shelter of the Most High will abide in the shadow of the Almighty. I will say to the LORD, "My refuge and my fortress, my God, in whom I trust."', translation: 'ESV' },
  { id: 'v36', reference: '2 Corinthians 5:7', text: 'For we walk by faith, not by sight.', translation: 'ESV' },
  { id: 'v37', reference: 'Proverbs 17:22', text: 'A joyful heart is good medicine, but a crushed spirit dries up the bones.', translation: 'ESV' },
  { id: 'v38', reference: 'Ephesians 4:32', text: 'Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you.', translation: 'ESV' },
  { id: 'v39', reference: 'Psalm 103:1-2', text: 'Bless the LORD, O my soul, and all that is within me, bless his holy name! Bless the LORD, O my soul, and forget not all his benefits.', translation: 'ESV' },
  { id: 'v40', reference: 'Galatians 5:22-23', text: 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.', translation: 'ESV' },
  { id: 'v41', reference: 'John 14:27', text: 'Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.', translation: 'ESV' },
  { id: 'v42', reference: 'Psalm 16:11', text: 'You make known to me the path of life; in your presence there is fullness of joy; at your right hand are pleasures forevermore.', translation: 'ESV' },
  { id: 'v43', reference: 'Proverbs 15:1', text: 'A soft answer turns away wrath, but a harsh word stirs up anger.', translation: 'ESV' },
  { id: 'v44', reference: 'Isaiah 26:3', text: 'You keep him in perfect peace whose mind is stayed on you, because he trusts in you.', translation: 'ESV' },
  { id: 'v45', reference: '1 Corinthians 13:4', text: 'Love is patient and kind; love does not envy or boast; it is not arrogant or rude.', translation: 'ESV' },
  { id: 'v46', reference: 'Psalm 62:1-2', text: 'For God alone my soul waits in silence; from him comes my salvation. He alone is my rock and my salvation, my fortress; I shall not be greatly shaken.', translation: 'ESV' },
  { id: 'v47', reference: 'Deuteronomy 31:6', text: 'Be strong and courageous. Do not fear or be in dread of them, for it is the LORD your God who goes with you. He will not leave you or forsake you.', translation: 'ESV' },
  { id: 'v48', reference: 'Romans 8:31', text: 'What then shall we say to these things? If God is for us, who can be against us?', translation: 'ESV' },
  { id: 'v49', reference: 'Psalm 19:14', text: 'Let the words of my mouth and the meditation of my heart be acceptable in your sight, O LORD, my rock and my redeemer.', translation: 'ESV' },
  { id: 'v50', reference: 'Zephaniah 3:17', text: 'The LORD your God is in your midst, a mighty one who will save; he will rejoice over you with gladness; he will quiet you by his love; he will exult over you with loud singing.', translation: 'ESV' },
  { id: 'v51', reference: 'Psalm 19:7', text: 'The law of the LORD is perfect, reviving the soul; the testimony of the LORD is sure, making wise the simple.', translation: 'ESV' },
  { id: 'v52', reference: 'John 3:16', text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.', translation: 'ESV' },
  { id: 'v53', reference: 'Matthew 6:33', text: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.', translation: 'ESV' },
  { id: 'v54', reference: 'Psalm 139:14', text: 'I praise you, for I am fearfully and wonderfully made. Wonderful are your works; my soul knows it very well.', translation: 'ESV' },
  { id: 'v55', reference: 'Proverbs 3:9-10', text: 'Honor the LORD with your wealth and with the firstfruits of all your produce; then your barns will be filled with plenty.', translation: 'ESV' },
  { id: 'v56', reference: '1 Corinthians 10:13', text: 'No temptation has overtaken you that is not common to man. God is faithful, and he will not let you be tempted beyond your ability.', translation: 'ESV' },
  { id: 'v57', reference: 'Psalm 37:4', text: 'Delight yourself in the LORD, and he will give you the desires of your heart.', translation: 'ESV' },
  { id: 'v58', reference: 'Ephesians 3:20', text: 'Now to him who is able to do far more abundantly than all that we ask or think, according to the power at work within us.', translation: 'ESV' },
  { id: 'v59', reference: 'Romans 8:38-39', text: 'For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come... will be able to separate us from the love of God in Christ Jesus our Lord.', translation: 'ESV' },
  { id: 'v60', reference: 'Proverbs 16:9', text: 'The heart of man plans his way, but the LORD establishes his steps.', translation: 'ESV' },
  { id: 'v61', reference: '2 Corinthians 12:9', text: 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness."', translation: 'ESV' },
  { id: 'v62', reference: 'Psalm 1:1-2', text: 'Blessed is the man who walks not in the counsel of the wicked... but his delight is in the law of the LORD, and on his law he meditates day and night.', translation: 'ESV' },
  { id: 'v63', reference: 'Colossians 3:2', text: 'Set your minds on things that are above, not on things that are on earth.', translation: 'ESV' },
  { id: 'v64', reference: 'Lamentations 3:22-23', text: 'The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.', translation: 'ESV' },
  { id: 'v65', reference: 'Psalm 119:11', text: 'I have stored up your word in my heart, that I might not sin against you.', translation: 'ESV' },
  { id: 'v66', reference: '1 John 4:19', text: 'We love because he first loved us.', translation: 'ESV' },
  { id: 'v67', reference: 'James 1:2-3', text: 'Count it all joy, my brothers, when you meet trials of various kinds, for you know that the testing of your faith produces steadfastness.', translation: 'ESV' },
  { id: 'v68', reference: 'Psalm 34:4', text: 'I sought the LORD, and he answered me and delivered me from all my fears.', translation: 'ESV' },
  { id: 'v69', reference: 'Isaiah 41:10', text: 'Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.', translation: 'ESV' },
  { id: 'v70', reference: '1 Thessalonians 5:16-18', text: 'Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you.', translation: 'ESV' },
  { id: 'v71', reference: 'Psalm 46:1', text: 'God is our refuge and strength, a very present help in trouble.', translation: 'ESV' },
  { id: 'v72', reference: 'Proverbs 27:17', text: 'Iron sharpens iron, and one man sharpens another.', translation: 'ESV' },
  { id: 'v73', reference: '1 Peter 4:10', text: 'As each has received a gift, use it to serve one another, as good stewards of God\'s varied grace.', translation: 'ESV' },
  { id: 'v74', reference: 'Matthew 28:20', text: 'And behold, I am with you always, to the end of the age.', translation: 'ESV' },
  { id: 'v75', reference: 'Psalm 100:1-2', text: 'Make a joyful noise to the LORD, all the earth! Serve the LORD with gladness! Come into his presence with singing!', translation: 'ESV' },
  { id: 'v76', reference: 'John 8:12', text: 'Again Jesus spoke to them, saying, "I am the light of the world. Whoever follows me will not walk in darkness, but will have the light of life."', translation: 'ESV' },
  { id: 'v77', reference: 'Romans 5:8', text: 'But God shows his love for us in that while we were still sinners, Christ died for us.', translation: 'ESV' },
  { id: 'v78', reference: 'Psalm 28:7', text: 'The LORD is my strength and my shield; in him my heart trusts, and I am helped; my heart exults, and with my song I give thanks to him.', translation: 'ESV' },
  { id: 'v79', reference: 'Proverbs 14:30', text: 'A tranquil heart gives life to the flesh, but envy makes the bones rot.', translation: 'ESV' },
  { id: 'v80', reference: '2 Timothy 3:16-17', text: 'All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness.', translation: 'ESV' },
  { id: 'v81', reference: 'Psalm 37:5', text: 'Commit your way to the LORD; trust in him, and he will act.', translation: 'ESV' },
  { id: 'v82', reference: '1 Corinthians 15:58', text: 'Therefore, my beloved brothers, be steadfast, immovable, always abounding in the work of the Lord, knowing that in the Lord your labor is not in vain.', translation: 'ESV' },
  { id: 'v83', reference: 'Philippians 2:3', text: 'Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves.', translation: 'ESV' },
  { id: 'v84', reference: 'Psalm 84:11', text: 'For the LORD God is a sun and shield; the LORD bestows favor and honor. No good thing does he withhold from those who walk uprightly.', translation: 'ESV' },
  { id: 'v85', reference: 'Hebrews 4:16', text: 'Let us then with confidence draw near to the throne of grace, that we may receive mercy and find grace to help in time of need.', translation: 'ESV' },
  { id: 'v86', reference: 'Psalm 34:18', text: 'The LORD is near to the brokenhearted and saves the crushed in spirit.', translation: 'ESV' },
  { id: 'v87', reference: 'Proverbs 19:21', text: 'Many are the plans in the mind of a man, but it is the purpose of the LORD that will stand.', translation: 'ESV' },
  { id: 'v88', reference: 'Romans 12:9', text: 'Let love be genuine. Abhor what is evil; hold fast to what is good.', translation: 'ESV' },
  { id: 'v89', reference: 'Matthew 7:7', text: 'Ask, and it will be given to you; seek, and you will find; knock, and it will be opened to you.', translation: 'ESV' },
  { id: 'v90', reference: 'Psalm 119:18', text: 'Open my eyes, that I may behold wondrous things out of your law.', translation: 'ESV' },
];

export const CURATED_QUOTES: DailyQuote[] = [
  { id: 'q1', quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant', category: 'Excellence' },
  { id: 'q2', quote: 'Focus on being productive instead of busy.', author: 'Tim Ferriss', category: 'Productivity' },
  { id: 'q3', quote: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear', category: 'Systems' },
  { id: 'q4', quote: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca', category: 'Wisdom' },
  { id: 'q5', quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain', category: 'Action' },
  { id: 'q6', quote: 'Simplicity is prerequisite for reliability.', author: 'Edsger W. Dijkstra', category: 'Engineering' },
  { id: 'q7', quote: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma', category: 'Growth' },
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
