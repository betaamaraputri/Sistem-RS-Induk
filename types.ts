export enum SenderType {
  USER = 'USER',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM' // For tool execution logs
}

export enum AgentRole {
  ORCHESTRATOR = 'Orkestrator Pusat',
  PATIENT_MGMT = 'Manajemen Pasien',
  SCHEDULING = 'Penjadwalan Janji Temu',
  MEDICAL_RECORDS = 'Rekam Medis',
  BILLING = 'Penagihan dan Asuransi'
}

export interface ChatMessage {
  id: string;
  sender: SenderType;
  text: string;
  timestamp: Date;
  agentRole?: AgentRole; // Which agent is speaking/acting
  isToolOutput?: boolean; // If this is a raw output from a sub-agent
}

export interface ProcessingState {
  isThinking: boolean;
  activeAgent: AgentRole | null;
}