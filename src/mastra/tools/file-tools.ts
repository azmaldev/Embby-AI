import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, '..', '..', '..');

function safePath(target: string): string {
  const resolved = path.resolve(WORKSPACE_ROOT, target);
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    throw new Error(`Path traversal blocked: "${target}" is outside the workspace`);
  }
  return resolved;
}

export const read = createTool({
  id: 'read_file',
  description: 'Read the full contents of a file. Use this to examine source code, config files, or any text file in the project.',
  inputSchema: z.object({
    path: z.string().describe('Path to the file relative to the project root'),
  }),
  outputSchema: z.object({ output: z.string() }),
  execute: async ({ path: filePath }) => {
    const resolved = safePath(filePath);
    const content = fs.readFileSync(resolved, 'utf-8');
    return { output: content };
  },
});

export const write = createTool({
  id: 'write_file',
  description: 'Create a new file or overwrite an existing one with new content. Requires approval before writing to disk.',
  inputSchema: z.object({
    path: z.string().describe('Path to the file relative to the project root'),
    content: z.string().describe('The full content to write to the file'),
  }),
  outputSchema: z.object({ output: z.string() }),
  requireApproval: true,
  execute: async ({ path: filePath, content }) => {
    const resolved = safePath(filePath);
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolved, content, 'utf-8');
    return { output: `File written: ${filePath}` };
  },
});

export const edit = createTool({
  id: 'edit_file',
  description: 'Make a precise edit to a file by replacing one exact string with another. Requires approval before modifying the file.',
  inputSchema: z.object({
    path: z.string().describe('Path to the file relative to the project root'),
    oldString: z.string().describe('The exact text to replace'),
    newString: z.string().describe('The text to replace it with'),
  }),
  outputSchema: z.object({ output: z.string() }),
  requireApproval: true,
  execute: async ({ path: filePath, oldString, newString }) => {
    const resolved = safePath(filePath);
    const content = fs.readFileSync(resolved, 'utf-8');

    const index = content.indexOf(oldString);
    if (index === -1) {
      throw new Error(`"${oldString.slice(0, 50)}..." was not found in ${filePath}`);
    }
    if (content.indexOf(oldString, index + 1) !== -1) {
      throw new Error(`"${oldString.slice(0, 50)}..." appears multiple times in ${filePath}. Use a longer string to uniquely identify the match.`);
    }

    const updated = content.slice(0, index) + newString + content.slice(index + oldString.length);
    fs.writeFileSync(resolved, updated, 'utf-8');
    return { output: `File edited: ${filePath}` };
  },
});

export const list = createTool({
  id: 'list_directory',
  description: 'List files and directories in a given path. Use a glob-like pattern (e.g., "**/*.ts") to filter results.',
  inputSchema: z.object({
    dirPath: z.string().optional().describe('Directory to list relative to project root. Defaults to root.'),
    pattern: z.string().optional().describe('Glob pattern to filter, e.g. "**/*.ts" or "*.md"'),
  }),
  outputSchema: z.object({ output: z.string() }),
  execute: async ({ dirPath, pattern }) => {
    const target = dirPath ? safePath(dirPath) : WORKSPACE_ROOT;
    const entries = fs.readdirSync(target, { withFileTypes: true });
    let results = entries.map(e => `${e.isDirectory() ? '/' : ''}${e.name}`);

    if (pattern) {
      const regex = new RegExp(
        '^' + pattern.replace(/\*\*/g, '<<<DOUBLESTAR>>>').replace(/\*/g, '[^/]*').replace(/<<<DOUBLESTAR>>>/g, '.*') + '$',
      );
      results = results.filter(r => regex.test(r));
    }

    return { output: results.join('\n') || '(empty)' };
  },
});

export const search = createTool({
  id: 'grep_files',
  description: 'Search file contents for a regex pattern. Returns file paths and matching lines.',
  inputSchema: z.object({
    regex: z.string().describe('A regex pattern to search for in file contents'),
    dirPath: z.string().optional().describe('Directory to search in relative to project root. Defaults to root.'),
    include: z.string().optional().describe('File glob to restrict search, e.g. "*.ts"'),
  }),
  outputSchema: z.object({ output: z.string() }),
  execute: async ({ regex, dirPath, include }) => {
    const target = dirPath ? safePath(dirPath) : WORKSPACE_ROOT;
    const re = new RegExp(regex, 'g');
    const lines: string[] = [];

    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name === '.git') continue;
          walk(full);
        } else if (entry.isFile()) {
          if (include && !entry.name.endsWith(include.replace('*', ''))) continue;
          try {
            const content = fs.readFileSync(full, 'utf-8');
            for (const [i, line] of content.split('\n').entries()) {
              if (re.test(line)) {
                lines.push(`${full}:${i + 1}: ${line.trim().slice(0, 120)}`);
              }
            }
          } catch {}
        }
      }
    }
    walk(target);

    return { output: lines.slice(0, 20).join('\n') || 'No matches found.' };
  },
});

export const remove = createTool({
  id: 'delete_file',
  description: 'Delete a file from the project. Requires approval before deleting.',
  inputSchema: z.object({
    path: z.string().describe('Path to the file to delete, relative to the project root'),
  }),
  outputSchema: z.object({ output: z.string() }),
  requireApproval: true,
  execute: async ({ path: filePath }) => {
    const resolved = safePath(filePath);
    fs.rmSync(resolved);
    return { output: `File deleted: ${filePath}` };
  },
});
