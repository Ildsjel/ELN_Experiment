export enum ExperimentStatus {
  Draft = 'Draft',
  InProgress = 'In Progress',
  Review = 'Under Review',
  Completed = 'Completed',
  Archived = 'Archived'
}

export interface Experiment {
  id: string;
  title: string;
  author: string;
  date: string;
  status: ExperimentStatus;
  content: string; // Markdown/Text content of observations
  protocolSteps: ProtocolStep[];
  tags: string[];
}

export interface ProtocolStep {
  id: string;
  instruction: string;
  completed: boolean;
  notes?: string;
}

export interface Sample {
  id: string;
  name: string;
  type: string;
  location: string;
  quantity: string;
  expiration: string;
  barcode: string;
}

export interface PlasmidFeature {
  name: string;
  start: number;
  end: number;
  type: 'promoter' | 'gene' | 'origin' | 'resistance' | 'terminator';
  color: string;
  direction: 1 | -1;
}

export interface AIAnalysisResult {
  summary: string;
  entities: {
    name: string;
    type: string; // e.g., 'Gene', 'Reagent', 'Equipment'
    confidence: number;
  }[];
  anomalies: string[];
  suggestions: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'Create' | 'Update' | 'Delete' | 'Sign' | 'Login' | 'Export';
  resourceType: 'Experiment' | 'Inventory' | 'System' | 'User';
  resourceId?: string;
  details: string;
}

export interface MachineBooking {
  id: string;
  userId: string;
  userName: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  purpose?: string;
}

export interface LabMachine {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'Available' | 'In Use' | 'Maintenance';
  bookings: MachineBooking[];
  nextMaintenance?: string;
}

export enum ViewState {
  Dashboard = 'dashboard',
  Experiments = 'experiments',
  Inventory = 'inventory',
  Molecular = 'molecular',
  Analytics = 'analytics',
  AuditLog = 'auditLog'
}