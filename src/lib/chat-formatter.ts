const CODE_BLOCK_WITH_PATH = /```\w+:[^\n]+\n[\s\S]*?```/g;
const DIVIDER_TAIL = /\n---\n[\s\S]*$/;
const EXCESS_NEWLINES = /\n{3,}/g;

export function formatAssistantContent(
  raw: string,
  maxLength = 600
): { display: string; fullDisplay: string; isTruncated: boolean } {
  // 1. Strip everything after --- divider (code dump section)
  let display = raw.replace(DIVIDER_TAIL, "").trim();

  // 2. Strip inline code blocks with file paths
  display = display.replace(CODE_BLOCK_WITH_PATH, "").trim();

  // 3. Clean up excessive whitespace
  display = display.replace(EXCESS_NEWLINES, "\n\n").trim();

  const fullDisplay = display;
  const isTruncated = display.length > maxLength;

  return { display: isTruncated ? truncate(display, maxLength) : display, fullDisplay, isTruncated };
}

function truncate(text: string, max: number): string {
  const cutoff = text.lastIndexOf("\n", max);
  return text.slice(0, cutoff > 200 ? cutoff : max) + "…";
}
