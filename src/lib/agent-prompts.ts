/**
 * @deprecated Sub-agent prompts are now managed in the edge function (supabase/functions/aiko-chat/index.ts).
 * This file is kept only for backward compatibility. Do not add new exports here.
 */

export const AIKO_SYSTEM_PROMPT = ""; // Deprecated — see edge function

export const SUB_AGENT_PROMPTS: Record<string, string> = {}; // Deprecated — see edge function

export function detectSubAgent(_message: string): string {
  return "ui_builder"; // Deprecated — routing is handled server-side
}
