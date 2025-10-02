/**
 * Strip HTML tags from a string
 * @param html - HTML string
 * @returns Plain text string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Truncate text to a specified length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add when truncated
 * @returns Truncated text
 */
export function truncateText(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) {
    return text;
  }

  return text.substring(0, length - suffix.length) + suffix;
}

/**
 * Sanitize HTML content for safe display
 * @param html - HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // Remove dangerous elements and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/style\s*=/gi, ''); // Remove inline styles for security
}

/**
 * Format a file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a slug from a title
 * @param title - Title string
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract plain text excerpt from HTML content
 * @param html - HTML content
 * @param length - Maximum excerpt length
 * @returns Plain text excerpt
 */
export function extractExcerpt(html: string, length: number = 160): string {
  const plainText = stripHtml(html);
  return truncateText(plainText, length);
}

/**
 * Count words in a text string
 * @param text - Text to count words in
 * @returns Number of words
 */
export function countWords(text: string): number {
  const plainText = typeof text === 'string' ? stripHtml(text) : '';
  return plainText.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimate reading time based on word count
 * @param text - Text content
 * @param wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns Estimated reading time in minutes
 */
export function estimateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const wordCount = countWords(text);
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Highlight search terms in text
 * @param text - Text to highlight
 * @param searchTerm - Term to highlight
 * @param className - CSS class for highlighting
 * @returns Text with highlighted search terms
 */
export function highlightSearchTerms(
  text: string,
  searchTerm: string,
  className: string = 'highlight'
): string {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, `<span class="${className}">$1</span>`);
}

/**
 * Check if an email address is valid
 * @param email - Email address to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Pluralize a word based on count
 * @param count - Number to check
 * @param singular - Singular form of the word
 * @param plural - Plural form of the word (optional, defaults to singular + 's')
 * @returns Pluralized word
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) {
    return singular;
  }
  return plural || singular + 's';
}