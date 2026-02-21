/**
 * Parses code blocks from AIKO AI responses.
 * Expected format: ```lang:filepath\n...code...\n```
 * e.g. ```tsx:src/screens/HomeScreen.tsx
 */

export interface ParsedCodeBlock {
  filePath: string;
  language: string;
  content: string;
}

const CODE_BLOCK_REGEX = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;

export function parseCodeBlocks(text: string): ParsedCodeBlock[] {
  const blocks: ParsedCodeBlock[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  CODE_BLOCK_REGEX.lastIndex = 0;

  while ((match = CODE_BLOCK_REGEX.exec(text)) !== null) {
    const language = match[1].trim();
    const filePath = match[2].trim();
    const content = match[3].trimEnd();

    if (filePath && content) {
      blocks.push({ filePath, language, content });
    }
  }

  return blocks;
}

export function hasCodeBlocks(text: string): boolean {
  CODE_BLOCK_REGEX.lastIndex = 0;
  return CODE_BLOCK_REGEX.test(text);
}
