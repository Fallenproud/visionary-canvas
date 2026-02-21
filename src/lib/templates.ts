export interface BoilerplateTemplate {
  name: string;
  description: string;
  files: Record<string, string>;
}

const GLOBAL_STYLES = `html, body, #root {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
* { box-sizing: border-box; }`;

export const expoBlankTemplate: BoilerplateTemplate = {
  name: "Blank App",
  description: "A minimal app with a single screen",
  files: {
    "/styles.css": GLOBAL_STYLES,
    "/App.tsx": `import "./styles.css";

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff",
      padding: 20,
    }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8, color: "#111" }}>
        Welcome to My App
      </h1>
      <p style={{ fontSize: 16, color: "#666" }}>Built with AIKO</p>
    </div>
  );
}`,
  },
};

export const expoTabsTemplate: BoilerplateTemplate = {
  name: "Tabs App",
  description: "An app with bottom tab navigation",
  files: {
    "/styles.css": GLOBAL_STYLES,
    "/App.tsx": `import "./styles.css";
import { useState } from "react";

function HomeScreen() {
  return (
    <div style={styles.screen}>
      <h1 style={styles.title}>Home</h1>
      <p style={styles.subtitle}>Welcome to your app</p>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div style={styles.screen}>
      <h1 style={styles.title}>Settings</h1>
      <p style={styles.subtitle}>Configure your app</p>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");

  return (
    <div style={styles.container}>
      {tab === "home" ? <HomeScreen /> : <SettingsScreen />}
      <div style={styles.tabBar}>
        <button
          style={{ ...styles.tab, color: tab === "home" ? "#007AFF" : "#999" }}
          onClick={() => setTab("home")}
        >
          Home
        </button>
        <button
          style={{ ...styles.tab, color: tab === "settings" ? "#007AFF" : "#999" }}
          onClick={() => setTab("settings")}
        >
          Settings
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" },
  screen: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8, color: "#111" },
  subtitle: { fontSize: 16, color: "#666" },
  tabBar: { display: "flex", borderTop: "1px solid #eee", height: 60 },
  tab: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center", background: "none", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 600 },
};`,
  },
};

export const templates: Record<string, BoilerplateTemplate> = {
  blank: expoBlankTemplate,
  tabs: expoTabsTemplate,
};
