export interface BoilerplateTemplate {
  name: string;
  description: string;
  files: Record<string, string>;
}

export const expoBlankTemplate: BoilerplateTemplate = {
  name: "Blank App",
  description: "A minimal app with a single screen",
  files: {
    "/App.tsx": `export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
    "/package.json": JSON.stringify(
      {
        name: "my-app",
        version: "1.0.0",
        main: "App.tsx",
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
        },
      },
      null,
      2
    ),
  },
};

export const expoTabsTemplate: BoilerplateTemplate = {
  name: "Tabs App",
  description: "An app with bottom tab navigation",
  files: {
    "/App.tsx": `import { useState } from "react";

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
  container: { display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  screen: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8, color: "#111" },
  subtitle: { fontSize: 16, color: "#666" },
  tabBar: { display: "flex", borderTop: "1px solid #eee", height: 60 },
  tab: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center", background: "none", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 600 },
};`,
    "/package.json": JSON.stringify(
      {
        name: "my-app",
        version: "1.0.0",
        main: "App.tsx",
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
        },
      },
      null,
      2
    ),
  },
};

export const templates: Record<string, BoilerplateTemplate> = {
  blank: expoBlankTemplate,
  tabs: expoTabsTemplate,
};
