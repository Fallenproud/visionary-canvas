export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  framework: 'react-native' | 'expo';
  status: 'draft' | 'building' | 'ready' | 'archived';
  file_tree: Record<string, any>;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_path: string;
  content: string;
  language: string;
  version: number;
  created_at: string;
  updated_at: string;
}
