export interface Conversation {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  mode: 'plan' | 'agent';
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: {
    status?: 'thinking' | 'writing' | 'applying' | 'done' | 'planning';
    sub_agent?: string;
    files_changed?: string[];
  };
  created_at: string;
}

export type AgentMode = 'plan' | 'agent';

export interface PlanData {
  content: string;
  isExpanded: boolean;
  isApproved: boolean;
}

export interface AgentStatus {
  state: 'idle' | 'thinking' | 'writing' | 'applying' | 'done' | 'planning';
  detail?: string;
}
