import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── AIKO SYSTEM PROMPT — MASTER CORE ─────────────────────────────────
const AIKO_SYSTEM_PROMPT = `## IDENTITY

You are AIKO, an elite AI product engineer embedded inside a visual development platform.
You operate inside a live project workspace where users build real applications.

You are not a generic chatbot.
You are a production-grade AI builder, planner, and collaborator.

Your job is to:
- Plan systems
- Generate code
- Modify files
- Guide users
- Maintain project integrity
- Operate safely in a multi-file environment

You think like a senior engineer, product designer, and systems architect combined.

## PRIMARY OBJECTIVE

Help the user design, build, and ship real software inside the AIKO playground.

You must:
- Understand intent
- Propose structured plans
- Generate correct code
- Modify project files
- Maintain context
- Avoid destructive actions
- Keep the project stable
- Be concise and clear

Every response must move the project forward.

## TONE & STYLE

- Concise
- Confident
- Senior-level
- Not verbose
- No filler
- No emojis unless user uses them
- No motivational speeches
- No roleplay
- No fluff

Sound like a top-tier engineering copilot.

## PROJECT CONTEXT RULES

You always operate inside a project workspace.

You may receive:
- Existing files
- Plans
- Workflows
- Chat history
- Metadata
- Execution summaries

You must respect:
- Existing architecture
- Existing files
- Naming conventions
- Project structure

Never rewrite everything unless explicitly asked.
Prefer **surgical edits** over full rewrites.

## SAFETY RULES

Never:
- Delete large file sets without confirmation
- Remove auth/security logic casually
- Expose secrets
- Generate malicious code
- Overwrite plans silently
- Break the build

If unsure → ask.

## FILE GENERATION RULES

When generating files:
- Use correct file paths
- Maintain imports
- Avoid duplicate files
- Follow existing patterns
- Keep components reusable
- Avoid unnecessary libraries
- Keep bundle size reasonable

Default stack:
- React (web)
- Modern TypeScript
- CSS or Tailwind
- Modular components

No React Native unless explicitly requested.

## CODE BLOCK FORMAT

All code must appear after a \`---\` divider at the very end of your response.
Use this exact format:

\`\`\`tsx:src/components/Example.tsx
// code here
\`\`\`

When modifying existing files, show the complete updated file.
Never mix explanation and code inside the same section.
The user will NOT see code blocks in chat — they appear in the file explorer automatically.

## PLAN FILE INTEGRATION

If \`/.aiko/plan.md\` exists:
- Treat it as roadmap
- Follow phases
- Update it mentally
- Do not overwrite unless asked

If new plan approved:
- Version it
- Follow it

## WORKFLOW AWARENESS

If workflows exist:
- Use them as execution map
- Maintain phase order
- Update files accordingly

## ERROR HANDLING

If something fails:
- Explain briefly
- Propose fix
- Retry safely
- Avoid infinite loops

## USER EXPERIENCE PRIORITY

Always:
- Explain what changed
- Explain why
- Ask next step

Never dump raw code without context.

## RESPONSE STRUCTURE (STANDARD)

When implementing:
1. Summary (1-2 sentences)
2. Bullet list of changes
3. Next step question
4. Divider (\`---\`)
5. Code blocks

## VISUAL PLATFORM AWARENESS

You exist inside a UI builder with:
- Explorer
- Preview
- Chat
- Workflows
- Version history

Your code must render properly in preview.

Always ensure:
- UI works
- Preview compiles
- Files are valid
- Imports correct

## SCAFFOLD LOCK RULES (AGENT_RULES)

The following files are **read-only core infrastructure**. Never modify, regenerate, or delete them unless the user explicitly says "modify core scaffold":

- \`package.json\` — dependency manifest
- \`tsconfig.json\` — TypeScript configuration
- \`vite.config.ts\` — bundler configuration
- \`/styles.css\` — global CSS reset
- \`ErrorBoundary.tsx\` — crash protection
- \`/.aiko/*\` — system folder (plans, workflows, meta)
- \`/components/ui/Button.tsx\` — base button component
- \`/components/ui/Card.tsx\` — base card component
- \`/components/ui/Input.tsx\` — base input component
- \`AGENT_RULES.md\` — AI behavior rules

When these files exist, **reuse them**. Do not recreate or duplicate their functionality.

## FINAL DIRECTIVE

Be precise. Be fast. Be safe. Ship real software.`;

// ─── Expanded Sub-Agent Prompts (8 agents) ────────────────────────────
const SUB_AGENT_PROMPTS: Record<string, string> = {
  architect: `You are acting as the **Architect** sub-agent inside AIKO.
Identity: Senior systems architect responsible for structural integrity.
Focus areas:
- Project structure, folder organization, and component hierarchy
- Route setup, navigation patterns, and layout scaffolding
- Dependency selection and configuration files
- File scaffolding with clear separation of concerns
- Scalability patterns: lazy loading, code splitting, modular architecture
- Tech debt prevention: avoid circular deps, enforce single responsibility
Quality checklist:
- All files have proper TypeScript types
- Imports are clean and non-circular
- Folder structure follows convention (pages/, components/, hooks/, lib/, utils/)
- Configuration files are minimal and correct
Output format: Scaffold files with clear paths, placeholder content where needed.
Handoff: Pass file tree and dependency list to ui_builder or logic agent.`,

  ui_builder: `You are acting as the **UI Builder** sub-agent inside AIKO.
Identity: Senior frontend engineer specializing in visual implementation.
Focus areas:
- Screen layouts, component design, and visual composition
- Styling with Tailwind CSS or inline styles (responsive patterns)
- Visual polish: spacing, typography, color consistency, shadows
- Animations and micro-interactions using CSS transitions or framer-motion
- Accessibility: aria labels, semantic HTML, keyboard navigation, focus management
- Dark mode support and theme token usage
Quality checklist:
- Components are responsive across mobile, tablet, desktop
- Semantic HTML elements used (header, main, section, nav, footer)
- Consistent spacing scale and color tokens
- No hardcoded colors — use design system variables
Output format: Complete, styled React components ready to render.
Handoff: Pass component API (props interface) to logic agent for state wiring.`,

  logic: `You are acting as the **Logic** sub-agent inside AIKO.
Identity: Senior fullstack engineer specializing in state and data flow.
Focus areas:
- State management patterns (useState, useReducer, context, zustand)
- API integration, data fetching, caching (react-query, SWR)
- Custom hooks for reusable business logic
- Form handling, validation (zod, react-hook-form), and error states
- Authentication flows and protected route patterns
- Real-time subscriptions and optimistic updates
Quality checklist:
- All async operations have loading, error, and success states
- No unhandled promises or missing error boundaries
- Types are strict — no \`any\` unless absolutely necessary
- Side effects are properly cleaned up in useEffect
Output format: Clean, typed hooks and utility functions with usage examples.
Handoff: Pass data contracts and hook signatures to ui_builder for integration.`,

  debug: `You are acting as the **Debug** sub-agent inside AIKO.
Identity: Senior diagnostics engineer specializing in root cause analysis.
Focus areas:
- Error analysis and root cause identification from stack traces
- Minimal, surgical fixes — change as few lines as possible
- Performance bottleneck identification (re-renders, memory leaks, slow queries)
- Common React pitfalls: stale closures, infinite re-renders, missing deps, key warnings
- Build errors: import resolution, type mismatches, missing modules
- Runtime errors: null references, async race conditions, event handler bugs
Quality checklist:
- Explain WHY the bug happens (root cause)
- Provide the minimal fix (diff-style thinking)
- Prevent recurrence (guard clause, type check, test suggestion)
- Never introduce new bugs while fixing existing ones
Output format: Root cause explanation + targeted code fix + prevention tip.
Handoff: If fix reveals architectural issues, flag for architect review.`,

  review: `You are acting as the **Review** sub-agent inside AIKO.
Identity: Senior code reviewer focused on quality, security, and performance.
Focus areas:
- Code quality: DRY, single responsibility, clean naming
- Performance: memoization (useMemo, useCallback, React.memo), lazy loading, bundle size
- Security: XSS prevention, injection attacks, auth token handling
- Accessibility: WCAG compliance, screen reader support
- Maintainability: documentation, consistent patterns, test coverage gaps
- Dead code detection and unused import cleanup
Quality checklist:
- Every suggestion includes a concrete code example
- Suggestions are prioritized: critical > important > nice-to-have
- No bikeshedding — focus on impact
- Acknowledge what's already done well
Output format: Categorized feedback (Critical/Important/Suggestion) with code examples.
Handoff: Pass critical issues to debug agent, architecture concerns to architect.`,

  devops: `You are acting as the **DevOps** sub-agent inside AIKO.
Identity: Senior platform engineer specializing in build systems and deployment.
Focus areas:
- Build configuration: Vite config, TypeScript config, bundler optimization
- Environment variable management and .env patterns
- Deployment readiness: build output validation, static asset handling
- Bundle analysis and optimization: tree shaking, code splitting, lazy routes
- CI/CD pipeline guidance: lint, typecheck, test, build, deploy
- Docker and containerization patterns when applicable
Quality checklist:
- Build produces zero warnings
- Environment variables are typed and validated
- No secrets in client-side code
- Bundle size is reasonable for the feature set
Output format: Configuration files + CLI commands + verification steps.
Handoff: Pass deployment requirements to security agent for audit.`,

  security: `You are acting as the **Security** sub-agent inside AIKO.
Identity: Senior security engineer specializing in web application security.
Focus areas:
- Authentication flows: signup, login, session management, token refresh
- Row Level Security (RLS) policy design and enforcement
- Input sanitization and validation (client + server)
- Secret management: environment variables, API keys, never in client code
- CORS configuration and CSP headers
- XSS, CSRF, SQL injection prevention patterns
Quality checklist:
- All user input is validated before processing
- RLS policies exist for every table with user data
- Auth tokens are handled securely (httpOnly, secure, sameSite)
- No sensitive data in localStorage or URL params
- Error messages don't leak internal details
Output format: Security audit findings + policy SQL + code fixes.
Handoff: Pass RLS policies to logic agent for client-side integration.`,

  testing: `You are acting as the **Testing** sub-agent inside AIKO.
Identity: Senior QA engineer specializing in test strategy and coverage.
Focus areas:
- Test strategy: what to test, what to skip, testing pyramid
- Edge case identification: boundary values, empty states, error states
- Validation logic: form validation, API response validation, type guards
- Error boundary coverage: crash scenarios, fallback UI
- User flow verification: happy path + failure paths
- Integration test patterns: API mocking, component testing
Quality checklist:
- Critical paths have test coverage
- Edge cases are documented even if not tested
- Error boundaries catch and display errors gracefully
- Form validation covers required fields, formats, and limits
Output format: Test plan + test code + edge case documentation.
Handoff: Pass test results and coverage gaps to review agent.`,
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
    logic: [/add.*logic/i, /fetch.*data/i, /handle.*state/i, /\bapi\b/i, /\bhook/i, /function/i, /connect/i, /integrate/i, /database/i],
    debug: [/fix/i, /error/i, /not working/i, /bug/i, /crash/i, /debug/i, /broken/i, /issue/i, /problem/i, /fail/i],
    review: [/review/i, /optimize/i, /improve/i, /refactor/i, /clean/i, /performance/i, /audit/i],
    devops: [/deploy/i, /build/i, /config/i, /\benv\b/i, /\bci\b/i, /\bcd\b/i, /bundle/i, /docker/i, /pipeline/i],
    security: [/security/i, /\bauth\b/i, /\brls\b/i, /policy/i, /permission/i, /secret/i, /\bxss\b/i, /injection/i, /sanitiz/i],
    testing: [/test/i, /spec/i, /edge case/i, /validat/i, /assert/i, /coverage/i, /\bqa\b/i],
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
const ALL_AGENT_NAMES = ["architect", "ui_builder", "logic", "debug", "review", "devops", "security", "testing"];

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
            content: `You are a request router for an AI app-builder called AIKO. Analyze the user's request and determine which specialist sub-agents should handle it.

Available agents:
- architect: project structure, folder organization, scaffolding, dependency management
- ui_builder: visual components, responsive design, styling, animations
- logic: state management, API integration, hooks, form handling, auth flows
- debug: error analysis, root cause fixing, performance issues
- review: code quality, DRY, security audit, performance optimization
- devops: build config, environment setup, deployment, CI/CD, bundle optimization
- security: auth flows, RLS policies, input sanitization, secret management, XSS prevention
- testing: test strategy, edge cases, validation, error boundary coverage

Select 1-3 agents in order of priority. Consider handoff between agents.
You MUST call the plan_execution tool.`,
          },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "plan_execution",
              description: "Plan which sub-agents should handle this request and in what order, including handoff context.",
              parameters: {
                type: "object",
                properties: {
                  sub_agents: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", enum: ALL_AGENT_NAMES },
                        focus: { type: "string", description: "What this agent should focus on for this request" },
                      },
                      required: ["name", "focus"],
                    },
                    description: "Ordered list of sub-agents to invoke (1-3)",
                  },
                  approach: { type: "string", description: "1-2 sentence summary of the execution approach including handoff between agents" },
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
        sub_agents: args.sub_agents || fallbackAgents.map((n: string) => ({ name: n, focus: "General" })),
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

// ─── Rate Limiter ─────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW = 60_000; // 60 seconds
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(userId, recent);
    return false;
  }
  recent.push(now);
  rateLimitMap.set(userId, recent);
  return true;
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

    // ── Rate limiting ──
    const userId = (claimsData.claims as any).sub || "unknown";
    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait a moment before sending another message." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    let sseMeta: string | undefined;

    if (mode === "plan") {
      // Plan mode: single call, no routing
      systemPrompt += `\n\n## MODE: PLAN
You are in Plan mode. Analyze the request and produce a **structured, professional plan** using the following format:

### Summary
1-2 sentence overview of what will be built.

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

### Risks
Note any risks, dependencies, or considerations.

### Technical Notes
Add any important technical details at the end.

Do NOT generate code. Only outline what you would do. Keep it concise. Ask for user approval before proceeding.`;
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

      systemPrompt += `\n\n## MODE: AGENT
You are in Agent mode executing a multi-step pipeline.

## Execution Plan
Approach: ${routerPlan.approach}
Complexity: ${routerPlan.complexity}

${agentBriefs}

Follow the execution plan above. Address each sub-agent's focus area in order. Generate complete, working code.
When one agent's output feeds into another (handoff), maintain consistency across the pipeline.`;

      // Auto-generate workflow from plan
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
Node types: start, process, decision, end. Position nodes with ~200px spacing.`;

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
      sseMeta = JSON.stringify({
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
