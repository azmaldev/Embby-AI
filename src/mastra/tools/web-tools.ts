import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

const turndown = new TurndownService();

function decodeEntities(str: string) {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export const webSearch = createTool({
  id: 'web-search',
  description: 'Search the web for current information. Use only when the user asks about something recent or you are unsure of a fact.',
  inputSchema: z.object({
    query: z.string().min(1).max(80).describe('A short, specific search query'),
  }),
  outputSchema: z.object({ output: z.string() }),
  execute: async ({ query }) => {
    try {
      const res = await fetch('https://html.duckduckgo.com/html/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `q=${encodeURIComponent(query)}`,
      });
      const html = await res.text();

      const matches = [...html.matchAll(/result__a[^>]*>(.*?)<\/a>.*?result__snippet[^>]*>(.*?)<\/a>/gs)].slice(0, 3);
      if (matches.length === 0) return { output: 'No results found.' };

      return {
        output: matches
          .map((m, i) => {
            const title = decodeEntities(m[1].replace(/<[^>]+>/g, ''));
            const snippet = decodeEntities(m[2].replace(/<[^>]+>/g, '')).slice(0, 150);
            return `${i + 1}. ${title} — ${snippet}`;
          })
          .join('\n'),
      };
    } catch {
      return { output: 'Search is temporarily unavailable.' };
    }
  },
});

export const webFetch = createTool({
  id: 'web-fetch',
  description: 'Fetch and read the full content of a specific URL. Use only after a search result looks promising and needs more detail.',
  inputSchema: z.object({
    url: z.string().url().describe('The exact URL to fetch'),
  }),
  outputSchema: z.object({ output: z.string() }),
  execute: async ({ url }) => {
    try {
      const res = await fetch(url);
      const html = await res.text();

      const dom = new JSDOM(html, { url });
      const article = new Readability(dom.window.document).parse();
      if (!article?.content) return { output: 'Could not extract readable content from this page.' };

      const markdown = turndown.turndown(article.content);
      const paragraphs = markdown.split('\n\n').slice(0, 6);

      return { output: paragraphs.join('\n\n') };
    } catch {
      return { output: 'Could not fetch this page.' };
    }
  },
});
