export type UserRole = 'technician' | 'manager' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type EquipmentStatus = 
  | 'Operational' 
  | 'Needs Inspection' 
  | 'Fault Reported' 
  | 'Under Repair' 
  | 'Critical';

export interface Equipment {
  id: string;
  equipment_code: string;
  name: string;
  equipment_type: string;
  manufacturer: string;
  model: string;
  location: string;
  installation_date?: string | null;
  status: EquipmentStatus;
  description?: string | null;
  recurring_fault: boolean;
  memory_count: number;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceCase {
  id: string;
  equipment_id: string;
  technician_id?: string | null;
  failure_date: string;
  symptoms: string;
  observations?: string | null;
  diagnosis: string;
  root_cause?: string | null;
  diagnostic_procedure?: string | null;
  repair_action: string;
  components_replaced?: string | null;
  outcome: string;
  downtime_hours: number;
  technician_notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined or helper fields
  equipment?: Equipment;
  equipment_code?: string;
  equipment_name?: string;
}

export interface HindsightMemory {
  id: string;
  equipment_id: string;
  case_id?: string | null;
  reported_symptom: string;
  initial_suspected_cause?: string | null;
  actual_root_cause: string;
  repair_action: string;
  parts_replaced?: string | null;
  hindsight_reflection: string;
  technician_name: string;
  created_at: string;
  equipment_code?: string;
  equipment_name?: string;
}

export interface MaintenanceDocument {
  id: string;
  equipment_id?: string | null;
  uploaded_by?: string | null;
  filename: string;
  document_type: string;
  extracted_text: string;
  created_at: string;
  equipment_code?: string;
  equipment_name?: string;
}

export interface AISimilarCase {
  case_id: string;
  similarity: number;
  equipment_code: string;
  equipment_name: string;
  symptoms: string;
  diagnosis: string;
  root_cause: string;
  repair_action: string;
  components_replaced: string;
  outcome: string;
  failure_date: string;
  hindsight_reflection?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  similarCases?: AISimilarCase[];
  imageAttachment?: string;
  isStreaming?: boolean;
}

export interface FleetStats {
  totalEquipment: number;
  totalCases: number;
  recurringFailures: number;
  resolvedCases: number;
  openActiveCases: number;
  downtimeHoursSaved: number;
  costSavings: number;
  activeSeats: number;
  monthlySavings: number;
}
