import { useEditorStore } from '@/stores/editorStore';
import { useSeoStore } from '@/stores/seoStore';
import { computed } from 'vue';

export function useSeo() {
  const seoStore = useSeoStore();
  const editorStore = useEditorStore();

  // Computed for the SEO status
  const seoStatus = computed(() => {
    const score = seoStore.seoScore;
    if (score >= 80) return 'good';
    if (score >= 50) return 'ok';
    return 'poor';
  });

  // Computed for the readability status
  const readabilityStatus = computed(() => {
    const score = seoStore.readabilityScore;
    if (score >= 80) return 'good';
    if (score >= 50) return 'ok';
    return 'poor';
  });

  // Analyze the SEO of the content
  const analyzeSeo = (content: string) => {
    const plainText = content;
    // const plainText = content ? content.replace(/<\/?[^>]+(>|$)/g, ' ') : '';
    const { focusKeyword, metaTitle } = seoStore;
    const firstParagraph = getFirstParagraph(content);
    const headings = getHeadings(content);

    // Skip analysis if there's no content
    if (!plainText.trim()) {
      return;
    }

    // Calculate keyword density if we have a focus keyword
    let keywordDensity = 0;
    let keywordInFirstParagraph = false;
    let keywordInHeadings = false;

    if (focusKeyword) {
      const keywordRegex = new RegExp(escapeRegExp(focusKeyword), 'gi');
      const keywordMatches = (plainText.match(keywordRegex) || []).length;
      const totalWords = plainText.split(/\s+/).length;

      keywordDensity = totalWords > 0 ? (keywordMatches / totalWords) * 100 : 0;
      keywordInFirstParagraph = firstParagraph.toLowerCase().includes(focusKeyword.toLowerCase());
      keywordInHeadings = headings.some((heading) => heading.toLowerCase().includes(focusKeyword.toLowerCase()));
    }

    // Check readability metrics
    const { readingEase, passiveVoice, sentenceLength, paragraphLength, transitionWords } =
      calculateReadability(plainText);
    seoStore.updateMetaDescription(editorStore.excerpt ?? '');
    seoStore.updateMetaTitle(editorStore.title);

    // Update SEO analysis
    seoStore.updateAnalysis({
      keywordDensity,
      keywordInTitle: metaTitle.toLowerCase().includes((focusKeyword || '').toLowerCase()),
      keywordInFirstParagraph,
      keywordInHeadings,
      keywordInUrl: editorStore.slug.toLowerCase().includes((focusKeyword || '').toLowerCase()),
      titleLength: metaTitle.length,
      descriptionLength: editorStore.excerpt?.length,
      readingEase,
      passiveVoice,
      sentenceLength,
      paragraphLength,
      transitionWords,
    });
  };

  // Extract the first paragraph from HTML content
  const getFirstParagraph = (htmlContent: string): string => {
    const match = htmlContent.match(/<p>(.*?)<\/p>/);
    return match ? match[1]!.replace(/<\/?[^>]+(>|$)/g, '') : '';
  };

  // Extract all headings from HTML content
  const getHeadings = (htmlContent: string): string[] => {
    const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
    const headings: string[] = [];
    let match: string;

    while ((match = headingRegex.exec(htmlContent)) !== null) {
      headings.push(match[1].replace(/<\/?[^>]+(>|$)/g, ''));
    }

    return headings;
  };

  // Calculate readability metrics
  const calculateReadability = (text: string) => {
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    // Calculate average sentence length (in words)
    const totalSentenceWords = sentences.reduce((total, sentence) => {
      return total + sentence.split(/\s+/).filter((w) => w.length > 0).length;
    }, 0);
    const avgSentenceLength = sentences.length > 0 ? totalSentenceWords / sentences.length : 0;

    // Calculate average paragraph length (in sentences)
    // Approximation: we assume paragraphs are separated by double newlines
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const totalParagraphSentences = paragraphs.reduce((total, paragraph) => {
      return total + paragraph.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    }, 0);
    const avgParagraphLength = paragraphs.length > 0 ? totalParagraphSentences / paragraphs.length : 0;

    // Estimate reading ease (Simplified Flesch Reading Ease)
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const syllables = countSyllables(text);
    const readingEase =
      words.length > 0 ? 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length) : 0;

    // Estimate passive voice (simple approximation)
    const passivePattern =
      /\b(am|is|are|was|were|be|been|being)\s+(\w+ed|built|bought|caught|done|felt|found|given|gone|had|heard|kept|known|left|lost|made|met|paid|put|read|said|seen|sent|set|shown|sung|sat|spoken|spent|stood|taken|told|thought|understood|worn|won)\b/gi;
    const passiveMatches = (text.match(passivePattern) || []).length;
    const passiveVoicePercentage = sentences.length > 0 ? (passiveMatches / sentences.length) * 100 : 0;

    // Estimate transition words usage
    const transitionWords = [
      'also',
      'besides',
      'furthermore',
      'moreover',
      'in addition',
      'therefore',
      'thus',
      'consequently',
      'as a result',
      'however',
      'nevertheless',
      'on the other hand',
      'in contrast',
      'first',
      'second',
      'third',
      'finally',
      'next',
      'then',
      'for example',
      'for instance',
      'in particular',
      'specifically',
      'in conclusion',
      'to summarize',
      'in summary',
    ];

    const transitionWordsRegex = new RegExp('\\b(' + transitionWords.join('|') + ')\\b', 'gi');
    const transitionMatches = (text.match(transitionWordsRegex) || []).length;
    const transitionPercentage = sentences.length > 0 ? (transitionMatches / sentences.length) * 100 : 0;

    return {
      readingEase: Math.max(0, Math.min(100, readingEase)),
      passiveVoice: Math.min(100, passiveVoicePercentage),
      sentenceLength: avgSentenceLength,
      paragraphLength: avgParagraphLength,
      transitionWords: transitionPercentage,
    };
  };

  // Helper to count syllables in text (approximation)
  const countSyllables = (text: string): number => {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    return words.reduce((total, word) => {
      word = word.replace(/[^a-z]/g, '');
      if (!word) return total;

      // Count vowel groups
      const vowelGroups = word.split(/[^aeiouy]+/).filter((group) => group.length > 0);
      let count = vowelGroups.length;

      // Adjust for common patterns
      if (word.length > 3 && word.endsWith('e') && !word.endsWith('le')) {
        count--;
      }

      if (word.endsWith('es') || (word.endsWith('ed') && !word.match(/[td]ed$/))) {
        count--;
      }

      // Every word has at least one syllable
      return total + Math.max(1, count);
    }, 0);
  };

  // Helper to escape regex special characters
  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\'); // Calculate readability metrics
  };
  // const calculateReadability = (text: string) => {
  //   // Split text into sentences
  //   const sentences = text.split(/[.!?]+/).')
  // }

  return {
    analyzeSeo,
    seoStatus,
    readabilityStatus,
  };
}
