const TRANSITION_WORDS = [
  'however', 'therefore', 'furthermore', 'moreover', 'nevertheless',
  'additionally', 'consequently', 'meanwhile', 'subsequently', 'although',
  'because', 'since', 'while', 'whereas', 'thus', 'hence', 'accordingly',
  'besides', 'similarly', 'in addition', 'in contrast', 'as a result',
  'for example', 'for instance', 'in conclusion', 'in summary',
  'first', 'second', 'finally', 'next', 'then', 'also',
];

// Strip markdown syntax to get plain text for analysis
function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')           // headings
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → keep label
    .replace(/```[\s\S]*?```/g, '')          // fenced code blocks
    .replace(/`[^`]+`/g, '')                 // inline code
    .replace(/^\s*[-*+]\s+/gm, '')           // unordered list markers
    .replace(/^\s*\d+\.\s+/gm, '')           // ordered list markers
    .replace(/^>\s+/gm, '')                  // blockquotes
    .replace(/^---+$/gm, '')                 // horizontal rules
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') // bold / italic
    .replace(/\n{3,}/g, '\n\n')             // collapse excess blank lines
    .trim();
}

// Extract heading text lines from raw markdown
function extractHeadings(markdown: string): string {
  return (markdown.match(/^#{1,6}\s+(.+)$/gm) ?? [])
    .map((h) => h.replace(/^#{1,6}\s+/, '').toLowerCase())
    .join(' ');
}

export const useSeo = () => {
  const seoStore = useSeoStore();

  const analyzeSeo = (markdown: string | undefined) => {
    if (!markdown?.trim()) {
      seoStore.updateAnalysis({
        keywordDensity: 0,
        keywordInFirstParagraph: false,
        keywordInHeadings: false,
        readingEase: 0,
        passiveVoice: 0,
        sentenceLength: 0,
        paragraphLength: 0,
        transitionWords: 0,
      });
      return;
    }

    const plain = stripMarkdown(markdown);
    const keyword = seoStore.focusKeyword.toLowerCase();

    const words = plain.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const keywordCount = keyword
      ? words.filter((w) => w.toLowerCase().includes(keyword)).length
      : 0;
    const keywordDensity = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

    const lowerPlain = plain.toLowerCase();
    const firstParagraph = lowerPlain.split(/\n\n/)[0] ?? '';
    const keywordInFirstParagraph = keyword ? firstParagraph.includes(keyword) : false;

    const headingText = extractHeadings(markdown);
    const keywordInHeadings = keyword ? headingText.includes(keyword) : false;

    const sentences = plain.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = Math.max(sentences.length, 1);
    const avgSentenceLength = wordCount / sentenceCount;

    const paragraphs = plain.split(/\n\n+/).filter((p) => p.trim().length > 0);
    const avgParagraphLength = paragraphs.length > 0 ? sentenceCount / paragraphs.length : 0;

    // Simplified Flesch reading ease proxy (shorter sentences = higher score)
    const readingEase = Math.max(0, Math.min(100, 100 - avgSentenceLength * 2));

    const passiveMatches = plain.match(/\b(was|were|been|being|is|are|am)\s+\w+ed\b/gi) ?? [];
    const passiveVoice = (passiveMatches.length / sentenceCount) * 100;

    const transitionWordCount = TRANSITION_WORDS.filter((tw) => lowerPlain.includes(tw)).length;
    const transitionWords = (transitionWordCount / sentenceCount) * 100;

    seoStore.updateAnalysis({
      keywordDensity: parseFloat(keywordDensity.toFixed(2)),
      keywordInFirstParagraph,
      keywordInHeadings,
      readingEase: parseFloat(readingEase.toFixed(1)),
      passiveVoice: parseFloat(passiveVoice.toFixed(1)),
      sentenceLength: parseFloat(avgSentenceLength.toFixed(1)),
      paragraphLength: parseFloat(avgParagraphLength.toFixed(1)),
      transitionWords: parseFloat(transitionWords.toFixed(1)),
    });
  };

  return { analyzeSeo };
};
