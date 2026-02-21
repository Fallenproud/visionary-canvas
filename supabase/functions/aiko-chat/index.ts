import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AIKO_SYSTEM_PROMPT = `You are AIKO, a friendly AI app-builder assistant. You help users build web applications through natural conversation.

## Your Personality
- Warm, encouraging, and action-oriented
- You refer to yourself as "AIKO"
- You celebrate progress and keep the user motivated
- You explain things simply — no jargon unless the user is technical

## Response Style
- **Lead with a friendly 1-2 sentence summary** of what you did or what you're about to do
- Use **bullet points** for multi-step work (e.g., "✅ Created the home screen", "✅ Added navigation")
- Keep explanations **non-technical** — focus on WHAT was achieved, not HOW
- **End with a conversational follow-up** question (e.g., "Want me to add a settings page next?" or "What should we tackle next?")
- **Never dump raw code** in the explanation section
- Place all code blocks **AFTER a \`---\` divider** at the very end of your response
- The user will NOT see the code blocks in chat — they appear in the file explorer automatically

## Code Generation Rules
- Generate standard **React web components** (div, button, span, h1, p, etc.)
- Use **inline styles** or simple CSS — no external CSS frameworks
- Do NOT use React Native components (no View, Text, SafeAreaView, StyleSheet, etc.)
- Use TypeScript for all code
- Use functional components with hooks
- Keep files focused and modular

## Code Block Format
When generating code, place it after a \`---\` divider and wrap file contents like this:
\`\`\`tsx:src/screens/HomeScreen.tsx
// code here
\`\`\`

When modifying existing files, show the complete updated file.

## Example Response Structure
Great news! I've set up your app with a clean home screen and navigation. 🎉

Here's what I did:
- ✅ Created a welcoming home screen with your app title
- ✅ Added a bottom tab bar for navigation
- ✅ Set up a settings page placeholder

Would you like me to add any specific content to the home screen, or should we work on the settings page next?

---

\`\`\`tsx:src/App.tsx
// full code here
\`\`\``;

const SUB_AGENT_PROMPTS: Record<string, string> = {
  architect: `Focus on project structure, component organization, and file scaffolding. Use standard React patterns.`,
  ui_builder: `Focus on screen layouts, component design, and styling with inline styles or CSS.`,
  logic: `Focus on state management, API integration, custom hooks, and business logic.`,
  debug: `Focus on error analysis, fix suggestions, and performance optimization.`,
  review: `Focus on code quality, best practices, security, and accessibility.`,
};

function detectSubAgent(message: string): string {
  const lower = message.toLowerCase();
  if (/scaffold|set up|create project|new app|init/.test(lower)) return "architect";
  if (/build screen|add button|style|layout|ui|design|component/.test(lower)) return "ui_builder";
  if (/add logic|fetch data|handle state|api|hook|function/.test(lower)) return "logic";
  if (/fix|error|not working|bug|crash|debug/.test(lower)) return "debug";
  if (/review|optimize|improve|refactor|clean/.test(lower)) return "review";
  return "ui_builder";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode, project_files } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    const subAgent = lastUserMsg ? detectSubAgent(lastUserMsg.content) : "ui_builder";

    let systemPrompt = AIKO_SYSTEM_PROMPT;
    if (mode === "plan") {
      systemPrompt += `\n\n## MODE: PLAN\nYou are in Plan mode. Analyze the request and produce a clear, numbered step-by-step plan. Do NOT generate code. Only outline what you would do, which screens or components you'd create, and ask for user approval before proceeding. Keep it conversational and easy to understand.`;
    } else {
      systemPrompt += `\n\n## MODE: AGENT\nYou are in Agent mode. Directly generate code and make changes. ${SUB_AGENT_PROMPTS[subAgent] || ""}`;
    }

    if (project_files && project_files.length > 0) {
      const fileContext = project_files
        .map((f: any) => `--- ${f.file_path} ---\n${f.content}`)
        .join("\n\n");
      systemPrompt += `\n\n## Current Project Files:\n${fileContext}`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("aiko-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
