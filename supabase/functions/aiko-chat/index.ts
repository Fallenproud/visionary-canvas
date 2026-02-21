import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AIKO_SYSTEM_PROMPT = `You are AIKO, an AI-powered mobile application builder assistant. You help users build React Native / Expo mobile applications through natural conversation.

## Your Personality
- Friendly, concise, and action-oriented
- You refer to yourself as "AIKO"
- You show clear status indicators for what you're doing

## Core Capabilities
- Scaffold mobile app projects from descriptions
- Generate React Native components, screens, and navigation
- Write hooks, utils, and business logic
- Debug and fix errors in mobile code
- Suggest architecture improvements

## Code Style Rules
- Use TypeScript for all code
- Use StyleSheet.create() for React Native styling
- Use functional components with hooks
- Follow React Native best practices
- Keep files focused and modular

## Response Format
When generating code, wrap file contents in code blocks with the file path as language tag:
\`\`\`tsx:src/screens/HomeScreen.tsx
// code here
\`\`\`

When modifying existing files, show the complete updated file.
Always explain what you're doing before showing code.`;

const SUB_AGENT_PROMPTS: Record<string, string> = {
  architect: `Focus on project structure, navigation setup, and file scaffolding.`,
  ui_builder: `Focus on screen layouts, component design, and styling with StyleSheet.`,
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

    // Detect sub-agent from last user message
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    const subAgent = lastUserMsg ? detectSubAgent(lastUserMsg.content) : "ui_builder";

    // Build system prompt
    let systemPrompt = AIKO_SYSTEM_PROMPT;
    if (mode === "plan") {
      systemPrompt += `\n\n## MODE: PLAN\nYou are in Plan mode. Analyze the request and produce a step-by-step plan. Do NOT generate code. Only outline what you would do, which files you'd create/modify, and ask for user approval before proceeding.`;
    } else {
      systemPrompt += `\n\n## MODE: AGENT\nYou are in Agent mode. Directly generate code and make changes. ${SUB_AGENT_PROMPTS[subAgent] || ""}`;
    }

    // Add project context if available
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
