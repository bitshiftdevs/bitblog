export type SeoState = {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  seoScore: number;
  readabilityScore: number;
  analysis: {
    keywordDensity: number;
    keywordInTitle: boolean;
    keywordInFirstParagraph: boolean;
    keywordInHeadings: boolean;
    keywordInUrl: boolean;
    titleLength: number;
    descriptionLength: number;
    readingEase: number;
    passiveVoice: number;
    sentenceLength: number;
    paragraphLength: number;
    transitionWords: number;
    improvements: string[];
  };
};

export const useSeoStore = defineStore('seo', {
  state: (): SeoState => ({
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    seoScore: 0,
    readabilityScore: 0,
    analysis: {
      keywordDensity: 0,
      keywordInTitle: false,
      keywordInFirstParagraph: false,
      keywordInHeadings: false,
      keywordInUrl: false,
      titleLength: 0,
      descriptionLength: 0,
      readingEase: 0,
      passiveVoice: 0,
      sentenceLength: 0,
      paragraphLength: 0,
      transitionWords: 0,
      improvements: [],
    },
  }),
  getters: {
    score: (state) => state.seoScore,
  },
  actions: {
    updateMetaTitle(title: string) {
      this.metaTitle = title;
      this.updateSeoScore();
    },
    updateMetaDescription(description: string) {
      this.metaDescription = description;
    },
    updateFocusKeyword(keyword: string) {
      this.focusKeyword = keyword;
      this.updateSeoScore();
    },
    updateAnalysis(analysis: Partial<SeoState['analysis']>) {
      this.analysis = { ...this.analysis, ...analysis };
      this.updateSeoScore();
      this.updateReadabilityScore();
    },
    updateSeoScore() {
      let score = 0;
      const { analysis } = this;

      // Calculate score based on analysis
      if (analysis.keywordInTitle) score += 15;
      if (analysis.keywordInFirstParagraph) score += 10;
      if (analysis.keywordInHeadings) score += 10;
      if (analysis.keywordInUrl) score += 5;

      // Keyword density (optimal is 1-2.5%)
      if (analysis.keywordDensity > 0 && analysis.keywordDensity <= 2.5) {
        score += 15;
      } else if (
        analysis.keywordDensity > 2.5 &&
        analysis.keywordDensity <= 4
      ) {
        score += 7.5;
      }

      // Title length (optimal is 50-60 chars)
      if (analysis.titleLength >= 30 && analysis.titleLength <= 60) {
        score += 15;
      } else if (analysis.titleLength > 0 && analysis.titleLength < 30) {
        score += 7.5;
      }

      // Description length (optimal is 120-155 chars)
      if (
        analysis.descriptionLength >= 120 &&
        analysis.descriptionLength <= 155
      ) {
        score += 15;
      } else if (
        analysis.descriptionLength > 0 &&
        analysis.descriptionLength < 120
      ) {
        score += 7.5;
      }

      // Normalize to 0-100
      this.seoScore = Math.min(Math.round(score), 100);

      // Generate improvement tips
      this.generateImprovements();
    },
    updateReadabilityScore() {
      let score = 0;
      const { analysis } = this;

      // Reading ease
      if (analysis.readingEase >= 60) {
        score += 25;
      } else if (analysis.readingEase >= 30) {
        score += 15;
      }

      // Passive voice (lower is better)
      if (analysis.passiveVoice <= 10) {
        score += 25;
      } else if (analysis.passiveVoice <= 20) {
        score += 15;
      }

      // Sentence length (optimal is 15-20 words)
      if (analysis.sentenceLength <= 20) {
        score += 25;
      } else if (analysis.sentenceLength <= 25) {
        score += 15;
      }

      // Paragraph length (optimal is 2-4 sentences)
      if (analysis.paragraphLength <= 4) {
        score += 15;
      } else if (analysis.paragraphLength <= 6) {
        score += 10;
      }

      // Transition words (higher is better)
      if (analysis.transitionWords >= 30) {
        score += 10;
      } else if (analysis.transitionWords >= 20) {
        score += 5;
      }

      // Normalize to 0-100
      this.readabilityScore = Math.min(Math.round(score), 100);
    },
    generateImprovements() {
      const improvements: string[] = [];
      const { analysis, metaTitle, metaDescription, focusKeyword } = this;

      if (!focusKeyword) {
        improvements.push('Add a focus keyword to analyze SEO performance');
      }

      if (!metaTitle) {
        improvements.push('Add a meta title for better SEO');
      } else if (analysis.titleLength < 30) {
        improvements.push('Meta title is too short. Aim for 50-60 characters');
      } else if (analysis.titleLength > 60) {
        improvements.push(
          'Meta title is too long. Keep it under 60 characters',
        );
      }

      if (!metaDescription) {
        improvements.push('Add a meta description for better SEO');
      } else if (analysis.descriptionLength < 120) {
        improvements.push(
          'Meta description is too short. Aim for 120-155 characters',
        );
      } else if (analysis.descriptionLength > 155) {
        improvements.push(
          'Meta description is too long. Keep it under 155 characters',
        );
      }

      if (focusKeyword && !analysis.keywordInTitle) {
        improvements.push(
          `Include the focus keyword "${focusKeyword}" in the title`,
        );
      }

      if (focusKeyword && !analysis.keywordInFirstParagraph) {
        improvements.push(
          `Include the focus keyword "${focusKeyword}" in the first paragraph`,
        );
      }

      if (focusKeyword && analysis.keywordDensity === 0) {
        improvements.push(
          `Include the focus keyword "${focusKeyword}" in your content`,
        );
      } else if (focusKeyword && analysis.keywordDensity > 4) {
        improvements.push(
          `Keyword density for "${focusKeyword}" is too high (${analysis.keywordDensity.toFixed(1)}%). Aim for 1-2.5%`,
        );
      }

      this.analysis.improvements = improvements;
    },
  },
});
