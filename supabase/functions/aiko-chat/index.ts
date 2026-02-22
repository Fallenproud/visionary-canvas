import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── AIKO System Prompt ───────────────────────────────────────────────
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
- **End with a conversational follow-up** question
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
- Always include a **/styles.css** file with a CSS reset
- Always add \`import "./styles.css";\` at the top of App.tsx
- The entry point is always **App.tsx**
- Do NOT create index.tsx or index.html

## Code Block Format
\`\`\`tsx:src/screens/HomeScreen.tsx
// code here
\`\`\`

When modifying existing files, show the complete updated file.`;

// ─── Rich Sub-Agent Prompts ───────────────────────────────────────────
const SUB_AGENT_PROMPTS: Record<string, string> = {
  architect: `You are acting as the **Architect** sub-agent.
Focus areas:
- Project structure, folder organization, and component hierarchy
- Route setup, navigation patterns, and layout scaffolding
- Dependency selection and configuration files
- File scaffolding with clear separation of concerns
Quality checklist: proper typing, clean imports, scalable folder structure.
Output: Create all necessary scaffold files with placeholder content.`,

  ui_builder: `You are acting as the **UI Builder** sub-agent.
Focus areas:
- Screen layouts, component design, and visual composition
- Styling with inline styles or CSS (responsive patterns)
- Visual polish, spacing, typography, and color consistency
- Animations and micro-interactions where appropriate
Quality checklist: accessibility (aria labels, semantic HTML), responsive design, consistent spacing.
Output: Complete, styled React components ready to render.`,

  logic: `You are acting as the **Logic** sub-agent.
Focus areas:
- State management patterns (useState, useReducer, context)
- API integration, data fetching, and caching strategies
- Custom hooks for reusable logic
- Form handling, validation, and error states
Quality checklist: error handling, loading states, type safety, no side-effect leaks.
Output: Clean, reusable hooks and utility functions.`,

  debug: `You are acting as the **Debug** sub-agent.
Focus areas:
- Error analysis and root cause identification
- Fix suggestions with minimal code changes
- Performance bottleneck identification
- Common React pitfalls (stale closures, infinite re-renders, missing deps)
Quality checklist: explain WHY the bug happens, provide the fix, and prevent recurrence.
Output: Clear explanation + targeted code fix.`,

  review: `You are acting as the **Review** sub-agent.
Focus areas:
- Code quality, best practices, and DRY principles
- Performance improvements (memoization, lazy loading)
- Security considerations (XSS, injection, auth)
- Accessibility and UX improvements
Quality checklist: actionable suggestions with code examples.
Output: Constructive feedback with specific improvement code.`,
};

// ─── Multi-Agent Intent Classifier ────────────────────────────────────
interface AgentMatch {
  name: string;
  score: number;
}

function detectSubAgents(message: string): string[] {
  const lower = message.toLowerCase();
  const agents: AgentMatch[] = [];

  const patterns: Record<string, RegExp[]> = {
    architect: [/scaffold/i, /set up/i, /create (a |new |the )?project/i, /new app/i, /init/i, /structure/i, /organize/i, /folder/i],
    ui_builder: [/build.*screen/i, /add.*button/i, /style/i, /layout/i, /\bui\b/i, /design/i, /component/i, /page/i, /form/i, /modal/i, /card/i, /header/i, /footer/i, /navbar/i],
    logic: [/add.*logic/i, /fetch.*data/i, /handle.*state/i, /\bapi\b/i, /\bhook/i, /function/i, /connect/i, /integrate/i, /auth/i, /login/i, /signup/i, /database/i],
    debug: [/fix/i, /error/i, /not working/i, /bug/i, /crash/i, /debug/i, /broken/i, /issue/i, /problem/i, /fail/i],
    review: [/review/i, /optimize/i, /improve/i, /refactor/i, /clean/i, /performance/i, /audit/i],
  };

  for (const [agent, regexes] of Object.entries(patterns)) {
    const matchCount = regexes.filter((r) => r.test(lower)).length;
    if (matchCount > 0) {
      agents.push({ name: agent, score: matchCount });
    }
  }

  agents.sort((a, b) => b.score - a.score);
  const result = agents.map((a) => a.name);
  return result.length > 0 ? result.slice(0, 3) : ["ui_builder"];
}

// ─── Router: Phase 1 (tool-calling for structured plan) ───────────────
async function routeRequest(
  userMessage: string,
  apiKey: string
): Promise<{ sub_agents: Array<{ name: string; focus: string }>; approach: string; complexity: string }> {
  const fallbackAgents = detectSubAgents(userMessage);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a request router for an AI app-builder. Analyze the user's request and determine which specialist sub-agents should handle it. Available agents: architect (project structure), ui_builder (visual components), logic (state/API/hooks), debug (error fixing), review (code quality). You MUST call the plan_execution tool.`,
          },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "plan_execution",
              description: "Plan which sub-agents should handle this request and in what order.",
              parameters: {
                type: "object",
                properties: {
                  sub_agents: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", enum: ["architect", "ui_builder", "logic", "debug", "review"] },
                        focus: { type: "string", description: "What this agent should focus on for this request" },
                      },
                      required: ["name", "focus"],
                    },
                    description: "Ordered list of sub-agents to invoke (1-3)",
                  },
                  approach: { type: "string", description: "1-2 sentence summary of the execution approach" },
                  complexity: { type: "string", enum: ["simple", "moderate", "complex"] },
                },
                required: ["sub_agents", "approach", "complexity"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "plan_execution" } },
      }),
    });

    if (!response.ok) {
      console.error("Router call failed:", response.status);
      return {
        sub_agents: fallbackAgents.map((name) => ({ name, focus: "General assistance" })),
        approach: "Direct execution with detected sub-agents",
        complexity: "moderate",
      };
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      return {
        sub_agents: args.sub_agents || fallbackAgents.map((n: string) => ({ n, focus: "General" })),
        approach: args.approach || "Direct execution",
        complexity: args.complexity || "moderate",
      };
    }
  } catch (err) {
    console.error("Router error, using fallback:", err);
  }

  return {
    sub_agents: fallbackAgents.map((name) => ({ name, focus: "General assistance" })),
    approach: "Direct execution with keyword-detected sub-agents",
    complexity: "moderate",
  };
}

// ─── Main Handler ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth validation ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, mode, project_files } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ── Input length validation ──
    const totalLength = JSON.stringify(messages).length;
    if (totalLength > 150000) {
      return new Response(
        JSON.stringify({ error: "Request too large. Please shorten your message or reduce project file context." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    const userContent = lastUserMsg?.content || "";

    // ── Build system prompt ──
    let systemPrompt = AIKO_SYSTEM_PROMPT;

    if (mode === "plan") {
      // Plan mode: single call, no routing
      systemPrompt += `\n\n## MODE: PLAN
You are in Plan mode. Analyze the request and produce a **structured, professional plan** using the following format:

### File Tree
Show all files that will be created or modified in a code block:
\`\`\`text
src/
  components/
    NewComponent.tsx    [NEW]
    Existing.tsx        [MODIFIED]
\`\`\`

### Phases
Organize work into numbered phases. Each phase has:
- A clear title (e.g., "Phase 1: Setup & Scaffolding")
- Numbered subtasks within each phase
- Brief description of what each subtask accomplishes

Example:
## Phase 1: Setup & Scaffolding
1. Create project structure and type definitions
2. Set up routing and navigation

## Phase 2: Core Features
1. Implement main component logic
2. Add state management hooks

### Technical Notes
Add any important technical details, dependencies, or considerations at the end.

Do NOT generate code. Only outline what you would do. Keep it conversational and easy to understand. Ask for user approval before proceeding.`;
    } else {
      // Agent mode: two-phase pipeline
      const routerPlan = await routeRequest(userContent, LOVABLE_API_KEY);

      // Build sub-agent context from the execution plan
      const agentBriefs = routerPlan.sub_agents
        .map((sa: { name: string; focus: string }) => {
          const prompt = SUB_AGENT_PROMPTS[sa.name] || "";
          return `### Sub-Agent: ${sa.name.toUpperCase()}\nFocus: ${sa.focus}\n${prompt}`;
        })
        .join("\n\n");

      systemPrompt += `\n\n## MODE: AGENT\nYou are in Agent mode executing a multi-step pipeline.\n\n## Execution Plan\nApproach: ${routerPlan.approach}\nComplexity: ${routerPlan.complexity}\n\n${agentBriefs}\n\nFollow the execution plan above. Address each sub-agent's focus area in order. Generate complete, working code.`;

      // Auto-generate workflow from plan: instruct AIKO to emit workflow JSON
      systemPrompt += `\n\n## Workflow Auto-Generation
When you detect an approved plan with phases/steps, also emit a workflow JSON file as a code block:
\`\`\`json:/.aiko/workflows/current-plan.json
{
  "id": "unique-id",
  "name": "Workflow Name",
  "description": "Brief description",
  "nodes": [{ "id": "n1", "label": "Phase 1 Name", "type": "process", "x": 100, "y": 100 }],
  "edges": [{ "from": "n1", "to": "n2", "label": "next" }]
}
\`\`\`
Node types: start, process, decision, end. Position nodes with ~200px spacing.
This workflow will be auto-saved and displayed in the Workflows viewer.`;

      // Inject existing workflow context
      if (project_files) {
        const workflowFiles = project_files.filter((f: any) => 
          f.file_path?.startsWith("/.aiko/workflows/") && f.file_path?.endsWith(".json")
        );
        if (workflowFiles.length > 0) {
          const wfContext = workflowFiles
            .map((f: any) => `--- ${f.file_path} ---\n${f.content}`)
            .join("\n\n");
          systemPrompt += `\n\n## Existing Workflows:\n${wfContext}`;
        }
      }

      // Emit SSE meta comment with sub-agent info (parsed by client)
      var sseMeta = JSON.stringify({
        sub_agents: routerPlan.sub_agents.map((sa: { name: string }) => sa.name),
        approach: routerPlan.approach,
        complexity: routerPlan.complexity,
      });
    }

    // Add project file context
    if (project_files && project_files.length > 0) {
      // Check for plan file and include it prominently
      const planFile = project_files.find((f: any) => f.file_path === "/.aiko/plan.md");
      if (planFile) {
        systemPrompt += `\n\n## Active Roadmap (/.aiko/plan.md)\nFollow this approved plan as your guide:\n${planFile.content}`;
      }

      const fileContext = project_files
        .filter((f: any) => f.file_path !== "/.aiko/plan.md")
        .map((f: any) => `--- ${f.file_path} ---\n${f.content}`)
        .join("\n\n");
      if (fileContext) {
        systemPrompt += `\n\n## Current Project Files:\n${fileContext}`;
      }
    }

    // ── Call main model (streaming) ──
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

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

    // Build a response stream that prepends the meta comment
    if (mode === "agent" && sseMeta) {
      const metaLine = new TextEncoder().encode(`: meta:${sseMeta}\n\n`);
      const originalBody = response.body!;

      const transformedStream = new ReadableStream({
        async start(controller) {
          // Prepend meta comment
          controller.enqueue(metaLine);

          const reader = originalBody.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(transformedStream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
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
