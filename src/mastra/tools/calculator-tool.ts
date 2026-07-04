import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const calculator = createTool({
  id: 'calculator',
  description: 'Evaluate a mathematical expression. Use for arithmetic that the model cannot reliably compute on its own.',
  inputSchema: z.object({
    expression: z.string().describe('A mathematical expression to evaluate, e.g. "2 + 2 * 3"'),
  }),
  outputSchema: z.object({
    result: z.number(),
  }),
  execute: async ({ expression }) => {
    const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
    const result = new Function('"use strict"; return (' + sanitized + ')')();
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Expression did not evaluate to a finite number');
    }
    return { result };
  },
});
