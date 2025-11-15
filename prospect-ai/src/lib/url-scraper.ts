import * as cheerio from 'cheerio';

export interface URLScrapingResult {
  text: string;
  title?: string;
  url: string;
}

/**
 * Scrapes and extracts text content from a URL
 * @param url - The URL to scrape
 * @returns Promise with extracted text and metadata
 */
export async function scrapeURL(url: string): Promise<URLScrapingResult> {
  try {
    // Validate URL
    const validatedURL = new URL(url);
    
    // Fetch the page
    const response = await fetch(validatedURL.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProspectAI/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, nav, footer, header').remove();

    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim();

    // Extract main content
    // Try to find main content areas first
    let text = '';
    const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content'];
    
    for (const selector of mainSelectors) {
      const mainContent = $(selector).text();
      if (mainContent && mainContent.length > 100) {
        text = mainContent;
        break;
      }
    }

    // Fallback to body if no main content found
    if (!text) {
      text = $('body').text();
    }

    // Clean up the text
    text = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();

    if (!text || text.length < 50) {
      throw new Error('Could not extract meaningful content from the URL');
    }

    return {
      text,
      title,
      url: validatedURL.toString(),
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      throw new Error('Invalid URL format. Please provide a valid URL.');
    }
    console.error('Error scraping URL:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to scrape URL. Please ensure the URL is accessible.'
    );
  }
}

/**
 * Validates if a string is a valid URL
 * @param url - The string to validate
 * @returns boolean indicating if string is a valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL by adding protocol if missing
 * @param url - The URL to normalize
 * @returns Normalized URL string
 */
export function normalizeURL(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}
