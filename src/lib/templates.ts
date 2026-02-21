export interface BoilerplateTemplate {
  name: string;
  description: string;
  files: Record<string, string>;
}

export const expoBlankTemplate: BoilerplateTemplate = {
  name: "Expo Blank",
  description: "A minimal Expo app with a single screen",
  files: {
    "/App.tsx": `import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to My App</Text>
        <Text style={styles.subtitle}>Built with AIKO</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
});`,
    "/package.json": JSON.stringify({
      name: "my-expo-app",
      version: "1.0.0",
      main: "App.tsx",
      dependencies: {
        "react": "^18.2.0",
        "react-native": "^0.72.0",
        "react-native-web": "^0.19.0",
      },
    }, null, 2),
  },
};

export const expoTabsTemplate: BoilerplateTemplate = {
  name: "Expo Tabs",
  description: "An Expo app with bottom tab navigation",
  files: {
    "/App.tsx": `import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';

function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Welcome to your app</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Configure your app</Text>
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');

  return (
    <SafeAreaView style={styles.container}>
      {tab === 'home' ? <HomeScreen /> : <SettingsScreen />}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} onPress={() => setTab('home')}>
          <Text style={[styles.tabText, tab === 'home' && styles.activeTab]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => setTab('settings')}>
          <Text style={[styles.tabText, tab === 'settings' && styles.activeTab]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', height: 60 },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 14, color: '#999' },
  activeTab: { color: '#007AFF', fontWeight: '600' },
});`,
    "/package.json": JSON.stringify({
      name: "my-expo-app",
      version: "1.0.0",
      main: "App.tsx",
      dependencies: {
        "react": "^18.2.0",
        "react-native": "^0.72.0",
        "react-native-web": "^0.19.0",
      },
    }, null, 2),
  },
};

export const templates: Record<string, BoilerplateTemplate> = {
  blank: expoBlankTemplate,
  tabs: expoTabsTemplate,
};
