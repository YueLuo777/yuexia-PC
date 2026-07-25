export type PromptWorkspaceMode = 'settings' | 'workflow';

export type PromptWorkspaceField = {
  label: string;
  instruction: string;
  source: string;
  kind: 'core' | 'archive' | 'rule' | 'record';
};

export type PromptWorkspaceSection = {
  id: string;
  title: string;
  summary: string;
  sourceFiles: string[];
  fields: PromptWorkspaceField[];
};

export type PromptWorkflowStep = {
  id: string;
  number: string;
  title: string;
  summary: string;
  sourceFiles: string[];
  reads: string[];
  outputs: string[];
  completion: string;
  next: string;
  kind: 'setup' | 'creation' | 'review' | 'maintenance';
};
