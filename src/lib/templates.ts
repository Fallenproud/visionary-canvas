export interface BoilerplateTemplate {
  name: string;
  description: string;
  files: Record<string, string>;
}

const GLOBAL_STYLES = `/* ─── Design Tokens ─── */
:root {
  --color-bg: #0a0a0b;
  --color-surface: #141416;
  --color-surface-hover: #1c1c1f;
  --color-border: #27272a;
  --color-text: #fafafa;
  --color-text-muted: #a1a1aa;
  --color-primary: #6366f1;
  --color-primary-hover: #818cf8;
  --color-danger: #ef4444;
  --color-success: #22c55e;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,.3);
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', monospace;
}

/* ─── Reset ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root {
  min-height: 100vh;
  width: 100%;
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button { cursor: pointer; font: inherit; }

/* ─── Utilities ─── */
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-col { display: flex; flex-direction: column; }
.gap-xs { gap: 4px; }
.gap-sm { gap: 8px; }
.gap-md { gap: 16px; }
.gap-lg { gap: 24px; }
.text-muted { color: var(--color-text-muted); }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const BUTTON_COMPONENT = `import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: "var(--radius-md)",
    fontWeight: 600,
    border: "none",
    transition: "all 0.15s ease",
    cursor: "pointer",
  },
  primary: { background: "var(--color-primary)", color: "#fff" },
  secondary: { background: "var(--color-surface)", color: "var(--color-text)", border: "1px solid var(--color-border)" },
  ghost: { background: "transparent", color: "var(--color-text-muted)" },
  danger: { background: "var(--color-danger)", color: "#fff" },
  sm: { padding: "6px 12px", fontSize: 13 },
  md: { padding: "8px 16px", fontSize: 14 },
  lg: { padding: "12px 24px", fontSize: 16 },
};

export function Button({ variant = "primary", size = "md", style, children, ...props }: ButtonProps) {
  return (
    <button
      style={{ ...styles.base, ...styles[variant], ...styles[size], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
`;

const CARD_COMPONENT = `import React from "react";

interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card({ title, description, children, style }: CardProps) {
  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      padding: 24,
      boxShadow: "var(--shadow-sm)",
      ...style,
    }}>
      {title && <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{title}</h3>}
      {description && <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16 }}>{description}</p>}
      {children}
    </div>
  );
}
`;

const HELPERS = `/** Conditionally join classNames */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Generate a random ID */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Format a date to a human-readable string */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(date));
}
`;

const RICH_APP = `import "./styles.css";
import { useState } from "react";
import { Button } from "./components/Button";
import { Card } from "./components/Card";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ minHeight: "100vh", padding: 32 }} className="flex-col gap-lg">
      <header className="flex-col gap-sm" style={{ textAlign: "center", paddingTop: 64 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          My App
        </h1>
        <p className="text-muted" style={{ fontSize: 16 }}>
          Built with AIKO — edit any file to get started
        </p>
      </header>

      <main style={{ maxWidth: 480, margin: "40px auto", width: "100%" }} className="flex-col gap-md">
        <Card title="Interactive Counter" description="A simple demo of state management.">
          <div className="flex-center gap-md" style={{ marginTop: 12 }}>
            <Button variant="secondary" size="sm" onClick={() => setCount((c) => c - 1)}>−</Button>
            <span style={{ fontSize: 28, fontWeight: 700, minWidth: 48, textAlign: "center" }}>{count}</span>
            <Button variant="primary" size="sm" onClick={() => setCount((c) => c + 1)}>+</Button>
          </div>
        </Card>

        <Card title="Getting Started" description="Here are some things you can ask AIKO:">
          <ul style={{ listStyle: "none", padding: 0 }} className="flex-col gap-xs">
            {["Add a navigation bar", "Create a login page", "Build a todo list", "Add dark mode toggle"].map((item) => (
              <li key={item} style={{
                padding: "10px 14px",
                background: "var(--color-surface-hover)",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                color: "var(--color-text-muted)",
              }}>
                💬 "{item}"
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </div>
  );
}
`;

export const expoBlankTemplate: BoilerplateTemplate = {
  name: "Blank App",
  description: "A minimal app with a single screen",
  files: {
    "/styles.css": GLOBAL_STYLES,
    "/components/Button.tsx": BUTTON_COMPONENT,
    "/components/Card.tsx": CARD_COMPONENT,
    "/utils/helpers.ts": HELPERS,
    "/App.tsx": RICH_APP,
  },
};

export const expoTabsTemplate: BoilerplateTemplate = {
  name: "Tabs App",
  description: "An app with bottom tab navigation",
  files: {
    "/styles.css": GLOBAL_STYLES,
    "/components/Button.tsx": BUTTON_COMPONENT,
    "/components/Card.tsx": CARD_COMPONENT,
    "/utils/helpers.ts": HELPERS,
    "/App.tsx": `import "./styles.css";
import { useState } from "react";
import { Button } from "./components/Button";
import { Card } from "./components/Card";

function HomeScreen() {
  return (
    <div style={{ flex: 1, padding: 24 }} className="flex-col gap-md flex-center">
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Home</h1>
      <Card title="Welcome" description="Start building your app with AIKO.">
        <Button variant="primary">Get Started</Button>
      </Card>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div style={{ flex: 1, padding: 24 }} className="flex-col gap-md flex-center">
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Settings</h1>
      <Card title="Preferences" description="Configure your app settings here.">
        <Button variant="secondary">Edit Profile</Button>
      </Card>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");

  return (
    <div className="flex-col" style={{ minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>
        {tab === "home" ? <HomeScreen /> : <SettingsScreen />}
      </div>
      <nav style={{
        display: "flex",
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        height: 56,
      }}>
        {["home", "settings"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "capitalize",
              color: tab === t ? "var(--color-primary)" : "var(--color-text-muted)",
              transition: "color 0.15s",
            }}
          >
            {t}
          </button>
        ))}
      </nav>
    </div>
  );
}
`,
  },
};

export const templates: Record<string, BoilerplateTemplate> = {
  blank: expoBlankTemplate,
  tabs: expoTabsTemplate,
};
