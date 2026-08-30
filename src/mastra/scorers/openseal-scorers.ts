import { z } from 'zod';
import { createToolCallAccuracyScorerLLM } from '@mastra/evals/scorers/prebuilt';
import { createCompletenessScorer } from '@mastra/evals/scorers/prebuilt';
import { getAssistantMessageFromRunOutput, getUserMessageFromRunInput } from '@mastra/evals/scorers/utils';
import { createScorer } from '@mastra/core/evals';
import type { Tool } from '@mastra/core/tools';
import { opensealModel } from '../model';

const availableTools: Tool[] = [
  { id: 'get-weather', description: 'Get current weather for a location' } as Tool,
  { id: 'calculator', description: 'Evaluate a mathematical expression. Use for arithmetic that the model cannot reliably compute on its own.' } as Tool,
  { id: 'web-search', description: 'Search the web for current information. Use only when the user asks about something recent or you are unsure of a fact.' } as Tool,
  { id: 'web-fetch', description: 'Fetch and read the full content of a specific URL. Use only after a search result looks promising and needs more detail.' } as Tool,
  { id: 'read_file', description: 'Read the full contents of a file. Use this to examine source code, config files, or any text file in the project.' } as Tool,
  { id: 'write_file', description: 'Create a new file or overwrite an existing one with new content. Requires approval before writing to disk.' } as Tool,
  { id: 'edit_file', description: 'Make a precise edit to a file by replacing one exact string with another. Requires approval before modifying the file.' } as Tool,
  { id: 'list_directory', description: 'List files and directories in a given path. Use a glob-like pattern (e.g., "**/*.ts") to filter results.' } as Tool,
  { id: 'grep_files', description: 'Search file contents for a regex pattern. Returns file paths and matching lines.' } as Tool,
  { id: 'delete_file', description: 'Delete a file from the project. Requires approval before deleting.' } as Tool,
];

export const toolCallAppropriatenessScorer = createToolCallAccuracyScorerLLM({
  model: opensealModel,
  availableTools,
});

export const completenessScorer = createCompletenessScorer();

export const translationScorer = createScorer({
  id: 'translation-quality-scorer',
  name: 'Translation Quality',
  description: 'Checks that non-English location names are translated and used correctly',
  type: 'agent',
  judge: {
    model: opensealModel,
    instructions:
      'You are an expert evaluator of translation quality for geographic locations. ' +
      'Determine whether the user text mentions a non-English location and whether the assistant correctly uses an English translation of that location. ' +
      'Be lenient with transliteration differences and diacritics. ' +
      'Return only the structured JSON matching the provided schema.',
  },
})
  .preprocess(({ run }) => {
    const userText = getUserMessageFromRunInput(run.input) || '';
    const assistantText = getAssistantMessageFromRunOutput(run.output) || '';
    return { userText, assistantText };
  })
  .analyze({
    description: 'Extract location names and detect language/translation adequacy',
    outputSchema: z.object({
      nonEnglish: z.boolean(),
      translated: z.boolean(),
      confidence: z.number().min(0).max(1).default(1),
      explanation: z.string().default(''),
    }),
    createPrompt: ({ results }) => `
            You are evaluating if a weather assistant correctly handled translation of a non-English location.
            User text:
            """
            ${results.preprocessStepResult.userText}
            """
            Assistant response:
            """
            ${results.preprocessStepResult.assistantText}
            """
            Tasks:
            1) Identify if the user mentioned a location that appears non-English.
            2) If non-English, check whether the assistant used a correct English translation of that location in its response.
            3) Be lenient with transliteration differences (e.g., accents/diacritics).
            Return JSON with fields:
            {
            "nonEnglish": boolean,
            "translated": boolean,
            "confidence": number,
            "explanation": string
            }
        `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    if (!r.nonEnglish) return 1;
    if (r.translated) return Math.max(0, Math.min(1, 0.7 + 0.3 * (r.confidence ?? 1)));
    return 0;
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `Translation scoring: nonEnglish=${r.nonEnglish ?? false}, translated=${r.translated ?? false}, confidence=${r.confidence ?? 0}. Score=${score}. ${r.explanation ?? ''}`;
  });

export const scorers = {
  toolCallAppropriatenessScorer,
  completenessScorer,
  translationScorer,
};
