import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { fastembed } from '@mastra/fastembed';
import { weather } from '../tools/weather-tool';
import { calculator } from '../tools/calculator-tool';
import { webSearch, webFetch } from '../tools/web-tools';
import { scorers } from '../scorers/weather-scorer';

export const embbyAgent = new Agent({
  id: 'embby-agent',
  name: 'Embby AI',
  instructions: `You are Embby AI, a helpful assistant that can provide accurate weather information and help plan activities based on the weather.

Your primary function is to help users with their queries. When responding about weather:
- Always ask for a location if none is provided
- If the location name isn't in English, please translate it
- If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
- Include relevant details like humidity, wind conditions, and precipitation
- Keep responses concise but informative
- If the user asks for activities and provides the weather forecast, suggest activities based on the weather forecast.
- If the user asks for activities, respond in the format they request.

Use the weather to fetch current weather data.
Use the calculator for any mathematical calculations.
Use the webSearch to search the web for current or factual information.
Use the webFetch to read the full content of a specific URL after a search result looks promising.`,
  model: 'groq/llama-3.3-70b-versatile',
  tools: { weather, calculator, webSearch, webFetch },
  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    translation: {
      scorer: scorers.translationScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'embby-storage',
      url: 'file:./embby.db',
    }),
    vector: new LibSQLVector({
      id: 'embby-vector',
      url: 'file:./embby.db',
    }),
    embedder: fastembed,
    options: {
      semanticRecall: true,
      observationalMemory: {
        model: 'groq/llama-3.3-70b-versatile',
      },
    },
  }),
});
